# Drag Regression Report & Fix

## Issue
After dragging audio slices on desktop Chrome, the slice **label** moved to the new position but the **audio data** did not. Clicking play would still play audio in the original order, not the new dragged order.

## Root Cause Analysis

### The Bug
The `updateSliceNumbers()` function was incorrectly recalculating `startTime` and `endTime` based on the new array order:

```typescript
// WRONG - This was causing the bug
const updateSliceNumbers = (sliceArray: Slice[]) => {
  let currentTime = 0;
  return sliceArray.map((slice) => {
    const startTime = currentTime;        // ❌ Recalculating based on new order
    const endTime = currentTime + slice.duration;  // ❌ Wrong!
    currentTime = endTime;
    return { ...slice, startTime, endTime };
  });
};
```

### Why This Broke Audio

The `createRearrangedBuffer()` function uses `startTime` and `endTime` to extract audio from the original buffer:

```typescript
const startSample = Math.floor(slice.startTime * sampleRate);
const endSample = Math.floor(slice.endTime * sampleRate);
```

When these values were modified, the function extracted **wrong audio** from the original buffer.

**Example:**
- Original: `[Kick(0-0.1s) | Snare(0.1-0.3s)]`
- After dragging Snare to first position with buggy code:
  - Snare slice now has `startTime: 0, endTime: 0.2` (recalculated!)
  - Audio extraction tries to get 0-0.2s from original
  - Gets Kick + half of Snare instead of just Snare ❌

## The Fix

### Understanding the Data Model
`startTime` and `endTime` represent **WHERE IN THE ORIGINAL AUDIO** a slice comes from. They must NEVER change. Only the **array order** determines playback sequence.

### Correct Implementation
```typescript
// CORRECT - Simple pass-through
const updateSliceNumbers = (sliceArray: Slice[]) => {
  // Simply return the array as-is
  // startTime/endTime represent positions in ORIGINAL audio and must NOT change
  // Only the array order changes, which determines playback sequence
  return sliceArray;
};
```

The rearranged buffer is automatically regenerated via the useEffect hook when the `slices` array changes:

```typescript
useEffect(() => {
  if (!audioBuffer || !audioProcessorRef.current || slices.length === 0) {
    setRearrangedBuffer(null);
    return;
  }
  const newRearrangedBuffer =
    audioProcessorRef.current.createRearrangedBuffer(audioBuffer, slices);
  setRearrangedBuffer(newRearrangedBuffer);
}, [audioBuffer, slices]);  // ← Triggers when array order changes
```

## Changes Made

1. **Fixed `updateSliceNumbers` in `BeatSlicer.tsx`**
   - Removed incorrect startTime/endTime recalculation
   - Now simply returns the array unchanged

2. **Added critical test in `WaveformDisplay.test.tsx`**
   - Test: "should preserve slice audio positions (startTime/endTime) when reordering"
   - Verifies that dragging changes array order but NOT audio positions
   - Prevents future regressions

3. **Created documentation**
   - `SLICE_DATA_MODEL.md` - Explains the architecture
   - `DRAG_TESTING_STRATEGY.md` - Complete testing approach
   - This report

## Testing to Prevent Regression

### Automated Tests
Run these to catch this bug immediately:

```bash
npm test -- WaveformDisplay.test.tsx
```

Key tests that would fail if regression occurs:
- ✓ should trigger waveform re-render when slices are reordered via drag
- ✓ should preserve slice audio positions (startTime/endTime) when reordering
- ✓ should update waveform with correct slice positions after drag

### Manual Testing
On desktop Chrome:
1. Load audio file with 8+ slices
2. Drag slice A to position of slice C
3. Verify: Slice A label appears after C
4. Click Play
5. Verify: Audio plays with A after C (not in original order)

## Files Modified

- `/client/src/pages/BeatSlicer.tsx` - Fixed `updateSliceNumbers`
- `/client/src/components/WaveformDisplay.test.tsx` - Added regression test
- `/client/src/test/setup.ts` - Added PointerEvent polyfill

## Related Documentation

- **SLICE_DATA_MODEL.md** - Architecture overview of how slices work
- **DRAG_TESTING_STRATEGY.md** - Comprehensive testing strategy
- **DRAG_QUICK_TEST.md** - Quick reference for manual testing
