# Product Requirements Document: Slice Randomise

## Introduction/Overview

The **Slice Randomise** feature adds a randomisation mode to Beat Slicer that allows users to quickly experiment with different slice arrangements through automated shuffling. This feature complements the existing drag-and-drop reordering functionality by enabling rapid, chance-based discovery of new beat patterns—a core workflow in beat-slicing tools like Propellerhead ReCycle.

**Problem Solved:** Users often want to explore different slice arrangements rapidly without manually dragging each slice. This feature provides a quick, intuitive way to generate random variations for creative experimentation.

---

## Goals

1. Enable users to enter a dedicated randomisation mode with a single click
2. Provide unlimited shuffle iterations so users can discover creative arrangements
3. Preserve the final randomised arrangement when exiting the mode
4. Maintain playback and export functionality while in randomisation mode
5. Provide clear visual feedback that the user is in randomisation mode

---

## User Stories

**Story 1: Quick Experimentation**
> As a beat-slicing user, I want to randomly shuffle my slices so that I can quickly explore different beat arrangements without manually dragging each slice.

**Story 2: Multiple Iterations**
> As a creative user, I want to click shuffle multiple times in a row so that I can audition several random variations and pick the one I like best.

**Story 3: Preserving Results**
> As a user, I want to exit randomisation mode and keep the arrangement I like so that I can export it or continue editing.

**Story 4: Seamless Workflow**
> As a user, I want to play back my audio while in randomisation mode so that I can hear how each shuffled arrangement sounds.

---

## Functional Requirements

### Entry Point
1. A **"Randomise"** button must be visible in the main control panel (alongside Play, Export, etc.)
2. The "Randomise" button must be **enabled** only when slices exist (after audio is loaded and slice count is configured)
3. The "Randomise" button must be **disabled** when no slices exist or before audio is loaded
4. Clicking "Randomise" must enter randomisation mode immediately

### Randomisation Mode - Active State
5. When randomisation mode is active, a visual indicator must display to clearly show the mode is enabled (subtle UI changes: dimmed non-relevant controls, highlight on Shuffle/Done buttons)
6. A **"Shuffle"** button must be visible and enabled while in randomisation mode
7. A **"Done"** button must be visible and enabled while in randomisation mode
8. The "Randomise" button must be hidden or disabled while in randomisation mode
9. All other controls (Play, Export, Loop, Volume, etc.) must remain visible and functional

### Shuffle Functionality
10. Clicking the "Shuffle" button must apply a new random reordering to all current slices
11. Each shuffle must produce a completely different random arrangement (no two consecutive shuffles should produce the same order)
12. The shuffle must use a proper randomisation algorithm (Fisher-Yates) to ensure uniform distribution
13. The waveform display must update immediately to reflect the new slice order
14. Slice letter labels (A, B, C, etc.) must remain attached to their original slices (e.g., if slice A is moved to position 3, it still displays as A)
15. User must be able to click "Shuffle" unlimited times while in randomisation mode
16. If audio is currently playing, playback must stop and restart from the beginning with the new slice order

### Exiting Randomisation Mode
17. Clicking the "Done" button must exit randomisation mode immediately without confirmation
18. The final slice order (whatever order exists when "Done" is clicked) must be preserved
19. Upon exiting, the UI must return to normal state (show "Randomise" button, hide "Shuffle"/"Done", remove mode indicator)
20. The slices must remain in the finalised order, allowing the user to continue with other operations (export, delete, duplicate, drag-and-drop)

### Edge Cases & Validation
21. If only 1 slice exists, the shuffle button must remain functional (shuffling has no visual effect, but operation completes without error)
22. The system must handle rapid clicking of the "Shuffle" button without errors or performance degradation
23. If the user navigates away from the randomisation mode (via page navigation or component unmount), the mode must reset to inactive

---

## Non-Goals (Out of Scope)

- Persisting randomisation mode state across page reloads or browser sessions
- Allowing users to undo/redo individual shuffles
- Generating specific patterns or "smart" randomisation based on audio analysis
- Adding audio playback preview during shuffle (shuffle happens instantly, no preview before commit)
- Adding a history of previous shuffle arrangements

---

## Design Considerations

### UI/UX
- **Visual Indicator:** Subtle dimming or greying out of controls not relevant to randomisation (Play, Export, Volume). Highlight the "Shuffle" and "Done" buttons prominently
- **Button Placement:** "Shuffle" and "Done" buttons should appear in the same control panel area, positioned next to each other for easy access
- **Color/Styling:** Consider a distinct color scheme or icon (e.g., dice/shuffle icon) for the "Randomise" and "Shuffle" buttons to reinforce the randomisation concept
- **Responsive Design:** Buttons must be accessible on mobile and tablet devices
- **Animation:** Use a fade-in/fade-out animation when entering and exiting randomisation mode (e.g., 200-300ms fade transition)

### Component Integration
- Randomisation mode controls should integrate seamlessly with the existing control panel (same area as Play, Export, Loop, Volume controls)
- The waveform display component must support updating slice order without full re-render
- Slice deletion via the X button on each slice card remains fully functional during randomisation mode; shuffling works with remaining slices

---

## Technical Considerations

### State Management
- Add a boolean state variable `isRandomisationMode` to the component managing slices and playback
- When entering/exiting randomisation mode, only the boolean flag changes—no data is modified or reset
- The current slice order array remains the source of truth; shuffling mutates this array

### Randomisation Algorithm
- Implement Fisher-Yates shuffle algorithm for uniform randomisation
- Example implementation:
  ```typescript
  function shuffleSlices(slices: Slice[]): Slice[] {
    const shuffled = [...slices];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  ```

### Playback Handling
- On shuffle, if audio is playing: stop playback, apply shuffle, restart from beginning
- Ensure the playback position indicator resets when shuffling during playback

### Integration Points
- Integrate with existing audio playback system to stop/restart on shuffle
- Ensure waveform visualization updates when slice order changes
- Maintain compatibility with existing features: drag-and-drop reordering, delete, duplicate, export

### Dependencies
- Existing slice data structure and state management
- Existing audio playback control
- Existing waveform display component

---

## Success Metrics

1. **Feature Adoption:** Users who load audio and create slices should access the Randomise feature (target: >30% of users with slices)
2. **Engagement:** Users who enter randomisation mode should click "Shuffle" multiple times (target: average 3+ shuffles per session)
3. **Completion:** Users should exit randomisation mode by clicking "Done" and proceed to export or further editing (target: >80% of users who enter mode will complete a shuffle iteration)
4. **Reliability:** Zero errors or crashes when shuffling with any number of slices (1–16)
5. **Performance:** Shuffle operation and waveform update must complete in <100ms

---

## Open Questions

None at this time. All clarifications have been resolved.

---

## Implementation Checklist

- [ ] Add `isRandomisationMode` state variable
- [ ] Implement Fisher-Yates shuffle function
- [ ] Create "Randomise" button in control panel
- [ ] Implement conditional rendering for "Shuffle" and "Done" buttons
- [ ] Implement visual indicator for randomisation mode (dimmed controls, highlighted buttons)
- [ ] Wire up "Randomise" button to enter mode and toggle visibility
- [ ] Wire up "Shuffle" button to shuffle array and update waveform
- [ ] Wire up "Done" button to exit mode
- [ ] Integrate playback stop/restart on shuffle
- [ ] Test with 1, 2, 4, 8, 16 slices
- [ ] Test rapid clicking and edge cases
- [ ] Update README.md features section
- [ ] User acceptance testing
