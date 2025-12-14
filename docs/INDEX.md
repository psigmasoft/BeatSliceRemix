# Beat Slicer Developer Documentation

Complete developer documentation for the Beat Slicer project.

## Quick Links

### Getting Started
- [Main README](../README.md) - Project overview, features, and quick start guide

### Architecture & Data Models
- **[Slice Data Model](SLICE_DATA_MODEL.md)** - Core data structure architecture
  - Explains why `startTime`/`endTime` are immutable
  - Data flow diagrams
  - Common misconceptions and how to avoid them

- **[Developer Notes on Slices](DEVELOPER_NOTES_SLICES.md)** - Quick reference for developers
  - Common tasks and patterns
  - Debugging tips
  - Checklist for making slice changes

### Drag and Drop (Slice Reordering)
- **[Drag Testing Strategy](DRAG_TESTING_STRATEGY.md)** - Comprehensive testing approach
  - Automated test documentation
  - Manual testing checklists for all platforms
  - Desktop: Chrome, Safari, Edge
  - Mobile: iOS Safari, iOS Chrome, Android Chrome

- **[Quick Test Checklist](DRAG_QUICK_TEST.md)** - Fast reference
  - Before testing checklist
  - Test cases for each platform
  - Problematic scenarios to verify
  - Performance checks

- **[Test Suite Documentation](SLICE_DRAG_WAVEFORM_TESTS.md)** - Automated tests
  - Detailed test descriptions
  - Test coverage areas
  - Configuration notes

- **[Drag Regression Report](DRAG_REGRESSION_REPORT.md)** - Historical reference
  - What went wrong in a previous regression
  - How it was identified and fixed
  - How to prevent similar issues

## Running Tests

```bash
# Run all waveform/drag tests
npm test -- WaveformDisplay.test.tsx

# Run all tests
npm test
```

## Key Principles

### The Golden Rule
**`startTime` and `endTime` NEVER change when reordering slices.** They represent where in the original audio a slice comes from, not its position in the playback order.

### Data Flow
1. User drags slice in UI
2. Array order changes
3. `useEffect` detects change and regenerates audio buffer
4. Rearranged buffer plays audio in new order
5. `startTime`/`endTime` remain fixed throughout

## Common Tasks

### Adding a new feature that modifies slices
1. Read [Slice Data Model](SLICE_DATA_MODEL.md)
2. Check [Developer Notes](DEVELOPER_NOTES_SLICES.md) checklist
3. Add test that verifies `startTime`/`endTime` don't change
4. Run `npm test -- WaveformDisplay.test.tsx`

### Debugging drag issues
1. Check [Quick Test Checklist](DRAG_QUICK_TEST.md) troubleshooting section
2. Review [Drag Regression Report](DRAG_REGRESSION_REPORT.md) for similar issues
3. Verify automated tests pass

### Testing on different platforms
1. Follow [Drag Testing Strategy](DRAG_TESTING_STRATEGY.md)
2. Use [Quick Test Checklist](DRAG_QUICK_TEST.md) for manual testing
3. Test on both desktop and mobile if making drag-related changes

## Architecture Files

Key files mentioned in documentation:

- `client/src/pages/BeatSlicer.tsx` - Main component, state management
- `client/src/components/WaveformDisplay.tsx` - Drag UI, visual layout
- `client/src/utils/audioProcessor.ts` - Audio reconstruction using `startTime`/`endTime`
- `client/src/components/WaveformDisplay.test.tsx` - Automated tests

## Support

For questions about:
- **Architecture**: See [Slice Data Model](SLICE_DATA_MODEL.md)
- **Development**: See [Developer Notes](DEVELOPER_NOTES_SLICES.md)
- **Testing**: See relevant testing docs above
- **Bugs/Regressions**: See [Drag Regression Report](DRAG_REGRESSION_REPORT.md)
