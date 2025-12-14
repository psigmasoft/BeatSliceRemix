# Slice Data Model Architecture

## The Slice Interface

```typescript
interface Slice {
  id: string;              // Unique identifier for this slice instance
  sliceNumber: number;     // Sequential position number (for labeling)
  sliceLabel: string;      // Visual label (A, B, C, etc.)
  colorHue: number;        // Color hue value (0-360)
  duration: number;        // Length of this slice in seconds
  startTime: number;       // WHERE THIS SLICE STARTS IN ORIGINAL AUDIO (IMMUTABLE)
  endTime: number;         // WHERE THIS SLICE ENDS IN ORIGINAL AUDIO (IMMUTABLE)
}
```

## Critical Principle: Array Order ≠ Audio Positions

The **array order** of slices determines **playback sequence**, but `startTime`/`endTime` determine **which audio to play**.

### Example

Original audio file: `[Kick(0-0.1s) | Snare(0.1-0.3s) | Hat(0.3-0.4s)]`

#### Initial State
```
slices array: [
  { id: 'slice-1', label: 'A', startTime: 0, endTime: 0.1 },      // Kick
  { id: 'slice-2', label: 'B', startTime: 0.1, endTime: 0.3 },    // Snare
  { id: 'slice-3', label: 'C', startTime: 0.3, endTime: 0.4 },    // Hat
]

Playback: Kick → Snare → Hat
```

#### After Dragging Hat to First Position
```
slices array: [
  { id: 'slice-3', label: 'C', startTime: 0.3, endTime: 0.4 },    // Hat (moved in array)
  { id: 'slice-1', label: 'A', startTime: 0, endTime: 0.1 },      // Kick
  { id: 'slice-2', label: 'B', startTime: 0.1, endTime: 0.3 },    // Snare
]

Playback: Hat → Kick → Snare

NOTE: startTime/endTime values NEVER changed!
```

## How It Works

### 1. Slice Generation
```typescript
generateSlices(buffer, count) {
  for (i = 0 to count) {
    startTime = i * duration;     // Position in ORIGINAL audio
    endTime = (i+1) * duration;   // Position in ORIGINAL audio
  }
}
```

### 2. Dragging Slices
```typescript
handleDrop() {
  newSlices = [...slices];
  const removed = newSlices.splice(draggedIndex, 1);
  newSlices.splice(dropIndex, 0, removed);  // Only array order changes
  onSlicesReorder(newSlices);                // startTime/endTime are untouched
}
```

### 3. Reconstructing Audio for Playback
```typescript
createRearrangedBuffer(originalBuffer, slices) {
  for (const slice of slices) {
    // Use startTime/endTime to extract from ORIGINAL audio
    const startSample = Math.floor(slice.startTime * sampleRate);
    const endSample = Math.floor(slice.endTime * sampleRate);
    
    // Copy this slice's audio to next position in rearranged buffer
    copyAudio(
      originalBuffer,
      slice.startTime, slice.endTime,  // FROM original positions
      rearrangedBuffer,
      currentPosition                   // TO current playback position
    );
  }
}
```

## Visual vs. Audio Positioning

| Aspect | Used For | Changes on Drag? | Determines |
|--------|----------|-----------------|-----------|
| **Array Order** | Playback sequence | ✓ Yes | Which slice plays next |
| **startTime/endTime** | Audio source location | ✗ NO | Which audio data to extract |
| **left/width (CSS)** | Visual position in waveform | ✓ Yes | Where label appears |
| **sliceLabel** | Visual identification | ✗ NO (usually) | What user sees (A, B, C) |

## Potential Issues and Solutions

### Issue: Audio Doesn't Match Label After Drag
**Symptom**: Label moves to new position but wrong audio plays
**Cause**: startTime/endTime were modified during reorder
**Solution**: Never modify startTime/endTime during reorder operations

### Issue: Rearranged Buffer Not Updating
**Symptom**: Dragging works but playback still uses old order
**Cause**: useEffect hook not triggering on slice array changes
**Solution**: Ensure `useEffect` dependency includes `slices` array

### Issue: Visual Positions Wrong
**Symptom**: Labels don't align with waveform dividers
**Cause**: `getSlicePosition` calculation error
**Solution**: Verify cumulative duration calculation is based on current array order

## Testing This Model

Key test: "should preserve slice audio positions (startTime/endTime) when reordering"
- Drags a slice to new array position
- Verifies array order changed
- **Verifies startTime/endTime remain unchanged** ← This is critical

```typescript
expect(reorderedSlices[2].startTime).toBe(0);  // Same value before/after drag
expect(reorderedSlices[2].endTime).toBe(1.0);
```

## Related Files

- `/client/src/utils/audioProcessor.ts` - `createRearrangedBuffer()` uses startTime/endTime
- `/client/src/pages/BeatSlicer.tsx` - `updateSliceNumbers()` must not modify these values
- `/client/src/components/WaveformDisplay.tsx` - `getSlicePosition()` uses array order for visual layout
