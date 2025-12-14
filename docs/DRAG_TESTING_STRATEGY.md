# Slice Drag Testing Strategy

## Overview

Slice dragging must work reliably across desktop and mobile platforms. This document outlines the testing approach to prevent regressions.

## Automated Tests

### Core Logic Tests

Located in `/client/src/components/WaveformDisplay.test.tsx`

**Status**: ✓ All passing

These tests validate:
- Slice reordering logic (array manipulation)
- Position recalculation after drag  
- State cleanup after drop
- Visual feedback during drag
- Self-drop prevention
- Correct slice position percentages after drag

**Run tests:**
```bash
npm test -- WaveformDisplay.test.tsx
```

**Test Results**:
- ✓ should trigger waveform re-render when slices are reordered via drag
- ✓ should update waveform with correct slice positions after drag
- ✓ should not reorder when dragging slice onto itself
- ✓ should clear drag state after drop completes

### Critical Test Cases

1. **Drag right (to higher index)**
   - Slice A (index 0) → Position 2
   - Expected: [B, C, A]
   - Validates: dropIndex adjustment after removal

2. **Drag left (to lower index)**
   - Slice C (index 2) → Position 0
   - Expected: [C, A, B]
   - Validates: correct insertion without adjustment

3. **Position recalculation**
   - After drag, slices must have correct startTime/endTime
   - After drag, slices must render at correct left/width percentages

4. **Multiple sequential drags**
   - Drag A→B, then B→C
   - Validates: state consistency across operations

## Manual Testing Checklist

### Desktop Browsers

#### Chrome/Edge (Windows/macOS)
- [ ] Load audio file
- [ ] Drag slice A to position 3 (right drag)
- [ ] Verify: Slice A label appears in new position
- [ ] Verify: Waveform slice boundaries align with new positions
- [ ] Verify: Playing audio plays slices in new order
- [ ] Drag slice C to position 1 (left drag)
- [ ] Verify: Order updates correctly

#### Safari (macOS)
- [ ] Repeat all Chrome/Edge tests
- [ ] Test drag cancellation (drag, then move outside and release)

### iOS Safari
- [ ] Load audio file
- [ ] Long-press slice to initiate drag
- [ ] Drag to new position
- [ ] Verify: Slice position updates
- [ ] Verify: Waveform boundaries update
- [ ] Test with 2-finger scroll enabled

### iOS Chrome
- [ ] Repeat iOS Safari tests

### Android Chrome
- [ ] Load audio file
- [ ] Long-press slice
- [ ] Drag to new position
- [ ] Verify: Position updates match desktop behavior

### Android Comet/Other Browsers
- [ ] Repeat Android Chrome tests

## Implementation Notes

### Critical Bug Fixes

1. **Data Model: startTime/endTime are IMMUTABLE**
   - **Critical Understanding**: `startTime` and `endTime` represent WHERE IN THE ORIGINAL AUDIO a slice comes from, NOT its position in the playback order
   - **Incorrect Approach**: Recalculating these values when reordering breaks audio reconstruction
   - **Correct Approach**: Only the array order changes; `startTime`/`endTime` remain fixed
   - **Example**:
     ```
     Original audio: [Kick(0-0.1s) | Snare(0.1-0.3s) | Hat(0.3-0.4s)]
     Array order: [Kick, Snare, Hat]
     
     After reordering to [Hat, Kick, Snare]:
     - Hat still has startTime: 0.3, endTime: 0.4 (unchanged!)
     - Kick still has startTime: 0, endTime: 0.1 (unchanged!)
     - Snare still has startTime: 0.1, endTime: 0.3 (unchanged!)
     - Only the array order changed, which determines playback sequence
     
     During playback:
     - Play Hat (0.3-0.4s from original)
     - Then play Kick (0-0.1s from original) 
     - Then play Snare (0.1-0.3s from original)
     ```

2. **Array Insertion Logic**
   - **Issue**: Drag reordering was placing slices at wrong indices
   - **Root Cause**: Complex conditional logic for index adjustment after removal
   - **Fix**: Simplified to `newSlices.splice(dropIndex, 0, removed)` after removal
   - The dropIndex refers to the position in the post-removal array, making it the correct insert point

3. **React Type Checking at Runtime**
   - **Issue**: Tests failed with "React.DragEvent is not an object"
   - **Root Cause**: Can't use `instanceof` with TypeScript types at runtime
   - **Fix**: Use property check instead: `if ('dataTransfer' in e)` to detect drag events

4. **PointerEvent Polyfill**
   - **Issue**: Tests failed with "PointerEvent is not defined"
   - **Fix**: Added PointerEvent polyfill to `client/src/test/setup.ts`

## Regression Prevention

### What Breaks Dragging

1. **Changes to `handleDrop` logic**
   - Array insertion after removal must correctly use post-removal indices
   - Tests validate slice order after drag operations
   - Test: "should trigger waveform re-render when slices are reordered via drag"

2. **Changes to `updateSliceNumbers`**
   - **CRITICAL**: Must NOT modify startTime/endTime - they represent audio source positions
   - startTime/endTime are immutable and determined at slice generation only
   - Only the array order should change during reordering
   - Test: "should preserve slice audio positions (startTime/endTime) when reordering"

3. **Changes to `createRearrangedBuffer`**
   - Must use `slice.startTime` and `slice.endTime` to extract audio from original buffer
   - These values are immutable and represent fixed positions in original audio
   - Tests validate that reordered slices play correct audio

4. **Changes to `getSlicePosition`**
   - Cumulative duration calculation must remain correct for visual positioning
   - Tests verify left/width percentages match expected values

5. **Changes to touch event handling**
   - Touch drag must trigger same handlers as mouse drag
   - Must not break drag flow for iOS/Android
   - Requires manual testing on devices

### Before Committing

1. Run automated tests:
   ```bash
   npm test -- WaveformDisplay.test.tsx
   ```

2. Manual test on primary platform (your dev machine)

3. If touching touch event code or drag logic, test on mobile device

## Test Data

Use the provided test slices for consistency:

```typescript
const slices: Slice[] = [
  {
    id: 'slice-1',
    sliceNumber: 1,
    sliceLabel: 'A',
    colorHue: 0,
    duration: 1.0,
    startTime: 0,
    endTime: 1.0,
  },
  {
    id: 'slice-2',
    sliceNumber: 2,
    sliceLabel: 'B',
    colorHue: 120,
    duration: 1.0,
    startTime: 1.0,
    endTime: 2.0,
  },
  {
    id: 'slice-3',
    sliceNumber: 3,
    sliceLabel: 'C',
    colorHue: 240,
    duration: 1.0,
    startTime: 2.0,
    endTime: 3.0,
  },
];
```

## Browser/Device Matrix

| Browser | Platform | Status | Notes |
|---------|----------|--------|-------|
| Chrome | Desktop | ✓ Supported | Primary target |
| Safari | macOS | ✓ Supported | |
| Edge | Windows | ✓ Supported | Chromium-based |
| Safari | iOS | ✓ Supported | Long-press to drag |
| Chrome | iOS | ✓ Supported | Long-press to drag |
| Chrome | Android | ✓ Supported | Long-press to drag |
| Firefox | Desktop | ○ Partial | Drag supported but untested |
| Firefox | Mobile | ○ Partial | Untested |

✓ = Tested and working
○ = Should work but untested
✗ = Known issue

## Debug Tips

### Drag not working at all
1. Check browser console for errors
2. Verify slice IDs are unique
3. Check if `draggedSliceId` state is being set (React DevTools)

### Slice moves but position wrong
1. Check `getSlicePosition` calculation
2. Verify `updateSliceNumbers` is recalculating times
3. Look at rendered `left` and `width` styles on slice elements

### Visual feedback missing
1. Check if `isDragging` class is applied
2. Verify opacity-40 class is present during drag
3. Check CSS transitions aren't being overridden

### Mobile drag not working
1. Verify touch events are firing (`handleTouchStart`, `handleTouchMove`, `handleTouchEnd`)
2. Check if `preventTouchScroll` is interfering
3. Test with `touch-none` class behavior

## Future Enhancements

1. **Visual drag preview**: Show where slice will land during drag
2. **Snap-to-grid**: Constrain drag to meaningful positions
3. **Mobile optimizations**: Larger touch targets, haptic feedback
4. **Keyboard support**: Arrow keys to reorder slices
