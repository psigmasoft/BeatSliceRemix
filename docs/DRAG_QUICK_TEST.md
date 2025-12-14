# Quick Drag Testing Checklist

Use this checklist when testing slice dragging on different platforms.

## Before Testing
- [ ] Load an audio file
- [ ] Audio is sliced into multiple pieces (8+ slices recommended)
- [ ] Note the initial slice order (A, B, C, D, E, etc.)

## Desktop Browsers (Chrome, Safari, Edge)

### Test Case 1: Drag Right
- [ ] Drag slice A to position after slice C
- [ ] Verify: Slice A appears after C
- [ ] Verify: Waveform boundaries update correctly
- [ ] Verify: Play audio plays slices in correct order

### Test Case 2: Drag Left
- [ ] Drag slice E to position before slice B
- [ ] Verify: Slice E appears before B
- [ ] Verify: Waveform updates

### Test Case 3: Cancel Drag
- [ ] Start dragging slice B
- [ ] Move cursor outside the waveform area
- [ ] Release mouse
- [ ] Verify: Slice B returns to original position
- [ ] Verify: No opacity-40 state remains

### Test Case 4: Self Drop
- [ ] Drag slice C onto itself
- [ ] Verify: Nothing happens
- [ ] Verify: Order unchanged

## Mobile Browsers (iOS Safari, iOS Chrome, Android Chrome)

### Setup
- [ ] Open app on device
- [ ] Load audio file
- [ ] Slices should be visible

### Test Case 1: Basic Drag
- [ ] Long-press (hold) slice A for 1-2 seconds
- [ ] Slide finger to slice C position
- [ ] Release
- [ ] Verify: Slice A moves after C
- [ ] Verify: Waveform updates

### Test Case 2: Drag Feedback
- [ ] During drag, dragged slice should appear slightly faded (opacity-40)
- [ ] Other slices remain opaque
- [ ] Drop target should highlight

### Test Case 3: Multiple Drags
- [ ] Drag slice A to new position
- [ ] Immediately perform another drag (B to new position)
- [ ] Verify: Both operations work correctly
- [ ] Verify: No state corruption

### Test Case 4: Playback After Drag
- [ ] Reorder some slices
- [ ] Tap Play
- [ ] Verify: Audio plays in new slice order
- [ ] Verify: Progress bar moves through correct slices

## Visual Verification

After each drag operation, verify:
- [ ] Slice label (A, B, C, etc.) appears in correct position
- [ ] Waveform dividers align with slice boundaries
- [ ] No slices are missing or duplicated
- [ ] Slice colors are preserved
- [ ] Duration text (xxs) is still visible

## Problematic Scenarios

Test these if you've made changes to drag code:

### Scenario 1: Dragging First Slice Right
- [ ] Drag A (position 0) to position 3
- [ ] Should result in [B, C, D, A, ...]

### Scenario 2: Dragging Last Slice Left
- [ ] Drag last slice to position 0
- [ ] Should result in [Last, A, B, C, ...]

### Scenario 3: Rapid Sequential Drags
- [ ] Drag A→C, immediately drag B→D
- [ ] No state conflicts
- [ ] Order is correct

### Scenario 4: Drag with Scrolling
(Desktop only)
- [ ] Create many slices (16+) so container scrolls
- [ ] Drag from left side to right side with horizontal scroll
- [ ] Verify: Drag works correctly across scroll

## Performance Check

After dragging:
- [ ] No lag when dragging
- [ ] Waveform redraws immediately after drop
- [ ] Play/pause still responsive
- [ ] No jank or stuttering during drag

## Reporting Issues

If drag fails:

1. **Note the browser/device**: iOS Safari, Android Chrome, etc.
2. **Describe what happened**: 
   - Did the slice move at all?
   - Did it move to wrong position?
   - Did the waveform update?
3. **Check console**: Open DevTools and look for JavaScript errors
4. **Create test case**: What slice count, which slices dragged, etc.

## Test Data

For consistency, always test with:
- Slice count: 8
- Sample audio: Beatslice_Test_Sample.wav (or similar)
- Test sequence: Drag A→D, then E→B, then C→A
