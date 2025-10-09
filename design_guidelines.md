# Design Guidelines: Beat Slicer Audio Tool

## Design Approach

**Selected Approach**: Design System (Material Design) with Audio Production Customization

**Justification**: This is a utility-focused professional audio tool where efficiency, precision, and workflow matter most. Drawing inspiration from industry-standard DAWs (Ableton Live, Logic Pro, FL Studio) while adapting Material Design principles for clarity and consistency.

**Key Design Principles**:
- Professional dark interface optimized for extended audio work
- Maximum information density without visual clutter
- Immediate visual feedback for all audio interactions
- Clear visual hierarchy prioritizing the waveform workspace

---

## Core Design Elements

### A. Color Palette

**Dark Mode Primary** (industry standard for audio production):
- Background Base: 220 15% 12% (deep slate)
- Surface Elevated: 220 12% 16% (slightly lighter slate)
- Surface Interactive: 220 10% 20% (card/panel backgrounds)

**Accent Colors**:
- Primary Action: 200 95% 55% (bright cyan) - for play/export buttons, active states
- Waveform Display: 200 70% 60% (lighter cyan) - for audio visualization
- Beat Markers: 280 60% 65% (vibrant purple) - for detected slice points
- Selection Highlight: 45 95% 60% (warm amber) - for selected slices
- Destructive Actions: 0 70% 55% (muted red) - for delete operations

**Text & UI Elements**:
- Primary Text: 220 10% 95%
- Secondary Text: 220 8% 70%
- Disabled/Muted: 220 5% 45%
- Borders/Dividers: 220 10% 25%

### B. Typography

**Font Families**:
- Primary: 'Inter' - for UI elements, buttons, labels
- Monospace: 'JetBrains Mono' - for numerical displays, timecodes, slice counters

**Type Scale**:
- Large Headings: 24px/32px, Semi-bold (tool title)
- Section Headers: 16px/24px, Medium (panel labels)
- Body/Interface: 14px/20px, Regular (controls, descriptions)
- Micro Labels: 12px/16px, Medium (timecodes, slice numbers)
- Monospace Data: 13px/18px, Regular (technical readouts)

### C. Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm (p-2, gap-4, mb-6, h-8, py-12, mt-16)

**Layout Structure**:
- Fixed header bar (64px height) with tool title, global actions
- Main workspace area (flexible height) containing waveform display
- Bottom control panel (80-100px height) for playback controls
- Slice management area below waveform for drag-drop reordering

**Grid System**:
- 12-column responsive grid for desktop
- Full-width stacked layout for mobile (not primary target but functional)

### D. Component Library

**Core UI Elements**:

1. **Waveform Display Panel**
   - Full-width centered container with dark background
   - Waveform rendered in bright cyan with amplitude visualization
   - Vertical slice markers in purple overlaid at detected beat points
   - Playhead indicator (thin vertical red line) showing current position
   - Hover tooltips showing time positions
   - Zoom controls (± buttons) for waveform detail inspection

2. **Slice Management Area**
   - Horizontal scrollable container below waveform
   - Individual slice cards showing:
     - Slice number badge (top-left)
     - Mini waveform preview (grayscale or muted cyan)
     - Duration indicator (bottom)
     - Delete button (X icon, top-right, muted red on hover)
   - Visual drop zones between slices during drag operations
   - Selected slice highlighted with amber border glow

3. **Control Panel**
   - Play/Pause button (large, circular, bright cyan)
   - Stop button (square, secondary cyan)
   - Export button (prominent, bright cyan, right-aligned)
   - Loop toggle switch
   - Volume slider with dB markers
   - BPM detection readout (monospace, purple accent)

**Navigation**:
- Minimal top bar with tool name/logo (left)
- File upload button (center-left, outlined style)
- Settings/help icons (right, subtle icons)

**Forms**:
- File upload: Drag-drop zone with dashed border, centered icon
- Slice count input: Number stepper for manual slice division override
- Export options: Modal dialog with format selection (WAV/MP3), quality settings

**Data Display**:
- Audio duration: MM:SS.MS format in monospace
- Slice count: Badge with number
- Detected BPM: Large numerical display with confidence indicator
- Waveform amplitude scale: Subtle vertical axis markers

**Overlays**:
- Loading state: Centered spinner with "Analyzing audio..." message
- Export progress: Linear progress bar with percentage
- Error messages: Toast notifications (top-right, red accent)
- Tutorial overlay: First-time user guide with spotlights on key features

### E. Interactions & Animations

**Use Sparingly**:
- Waveform load-in: Smooth fade and draw animation (300ms)
- Slice card drag: Subtle lift shadow, smooth position transitions
- Playhead movement: Smooth linear animation matching audio playback
- Button states: Minimal scale feedback (0.98 on press)
- Slice deletion: Quick fade-out (200ms)

**No Animation For**:
- Waveform rendering during playback (performance critical)
- Slice reordering during rapid dragging
- Volume slider adjustments

---

## Specific Component Specifications

**Waveform Visualization**:
- Height: 320px on desktop, 240px on tablet
- Stereo: Display two waveforms stacked if stereo file detected
- Amplitude range: -1.0 to +1.0 with center zero line
- Grid: Subtle vertical time markers every second

**Slice Cards**:
- Size: 120px × 100px fixed dimensions
- Border: 2px solid border, transparent default, amber when selected
- Drop shadow: Elevation when dragging (0 4px 12px rgba(0,0,0,0.4))
- Drag cursor: Grabbing hand cursor

**Upload Zone**:
- Size: 600px × 200px centered container
- State visual: Dashed border changes to solid cyan on drag-over
- Supported formats badge: ".wav, .mp3, .aiff" in small text below

---

## Images

**No large hero images** - this is a utility application focused on the workspace.

**Icon Usage**:
- Use Material Icons CDN for consistent icon set
- Icons needed: play_arrow, pause, stop, volume_up, file_upload, delete, settings, help, drag_indicator, download
- Icon sizes: 20px (inline), 24px (buttons), 32px (large actions)

**Placeholder Audio Visualization**:
- Initial state: Illustrated icon or simple graphic showing waveform concept
- Center of upload zone before file is loaded

---

## Accessibility & Responsiveness

- Maintain dark mode throughout entire application
- All interactive elements minimum 44px touch target
- Keyboard navigation: Arrow keys for slice selection, Space for play/pause, Delete key for slice removal
- ARIA labels for all waveform regions and slice elements
- High contrast maintained between waveform and background (4.5:1 minimum)
- Focus indicators: 2px cyan outline on keyboard focus

---

## Page Layout Summary

**Single-page application structure**:
1. Top bar (64px fixed)
2. File upload area (collapsed after file loaded)
3. Waveform workspace (primary focus, flexible height)
4. Slice reorder area (horizontal scrollable, 140px height)
5. Control panel (bottom fixed, 80px height)

**Viewport usage**: Natural height based on content, no forced 100vh constraints. Waveform area uses remaining viewport space after fixed elements.