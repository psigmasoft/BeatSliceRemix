# Developer Notes: Working with Slices

## Quick Reference

### What is a Slice?
A slice is a segment of the original audio file that can be reordered for playback.

### The Golden Rule ⭐
**startTime and endTime NEVER change when reordering slices.**

These values represent where in the **original audio** the slice comes from. They are set once at slice generation and remain immutable.

## Common Tasks

### Adding a New Slice Operation
If you add code that manipulates slices (delete, duplicate, reorder, etc.):

1. **Update array order only** - Add/remove from the `slices` array
2. **Never modify startTime/endTime** - These are immutable
3. **Let useEffect regenerate buffer** - The dependency on `slices` will trigger buffer reconstruction
4. **Add test** - Verify startTime/endTime don't change

Example:
```typescript
const handleSomethingNewWithSlices = () => {
  const newSlices = slices.filter(...);  // ✓ Array manipulation
  // newSlices[0].startTime = 0.5;       // ✗ DON'T DO THIS
  setSlices(newSlices);                  // ✓ Let useEffect handle the rest
};
```

### Debugging Drag Issues
If dragging doesn't work:

1. Check browser console for errors
2. Verify `handleDrop` is being called:
   - Add `console.log('Drop:', draggedIndex, dropIndex)`
3. Verify array is actually reordering:
   - Check slice IDs are in different order
4. Verify audio is wrong (if label moves but audio doesn't):
   - Check if startTime/endTime changed (they shouldn't!)
   - Run automated test: `npm test -- WaveformDisplay.test.tsx`

### Testing Slice Changes
Always add tests for operations that change the `slices` array:

```typescript
it('should handle [your operation]', () => {
  const slices = [/* test data */];
  const newSlices = performOperation(slices);
  
  // Verify order changed if expected
  expect(newSlices[0].id).toBe('new-first-slice');
  
  // CRITICAL: Verify audio positions unchanged
  expect(newSlices[0].startTime).toBe(0);      // Same as before
  expect(newSlices[0].endTime).toBe(1.0);      // Same as before
});
```

### Understanding the Data Flow

```
User drags slice
  ↓
handleDrop() called
  ↓
Array order changes
  ↓
onSlicesReorder(newSlices) called
  ↓
setSlices(newSlices)
  ↓
useEffect detects slices dependency changed
  ↓
createRearrangedBuffer(originalBuffer, slices)
  - Uses slice.startTime to find audio in original
  - Uses slice.endTime to find audio in original
  - Copies audio in NEW array order to rearrangedBuffer
  ↓
setRearrangedBuffer(newRearrangedBuffer)
  ↓
Playback uses rearrangedBuffer
  ↓
Audio plays in new order ✓
```

## Key Files

| File | Purpose | Do NOT touch |
|------|---------|--------------|
| `BeatSlicer.tsx` | Manages slices state | `startTime`/`endTime` updates |
| `WaveformDisplay.tsx` | Drag UI, visual layout | `startTime`/`endTime` |
| `audioProcessor.ts` | Audio reconstruction | The algorithm using `startTime`/`endTime` |
| `WaveformDisplay.test.tsx` | Drag tests | Keep test for `startTime`/`endTime` immutability |

## Checklist for Making Slice Changes

- [ ] Changes only manipulate array order
- [ ] `startTime`/`endTime` are never modified
- [ ] `useEffect` with `slices` dependency will regenerate buffer
- [ ] Added test that verifies `startTime`/`endTime` don't change
- [ ] Test passes: `npm test -- WaveformDisplay.test.tsx`
- [ ] Manual test on desktop Chrome:
  - Drag a slice
  - Verify label moves
  - Play audio and verify it plays in new order

## Common Mistakes

❌ **Mistake**: "I'll update startTime/endTime when reordering"
✓ **Correct**: Only the array order changes

❌ **Mistake**: "I'll update sliceNumber when reordering"
✓ **Correct**: Leave sliceNumber as-is (or update for display only)

❌ **Mistake**: "I'll update sliceLabel to reflect new position"
✓ **Correct**: sliceLabel should reflect original slice identity (A=0, B=1, etc.)

## Performance Notes

- `createRearrangedBuffer` is called every time `slices` array changes
- It's O(n) where n = total audio samples
- For typical audio (< 5min), this is < 100ms
- Consider memoization if this becomes a bottleneck

## Questions?

Before making changes to slice handling:
1. Read `SLICE_DATA_MODEL.md` for architecture
2. Check if `startTime`/`endTime` are involved
3. If so, verify they're not being modified
4. Add test to prevent regression
