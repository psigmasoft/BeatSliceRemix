# Beat Slicer

A powerful beat-slicing audio manipulation tool inspired by the Amen break rearrangement technique and Propellerhead ReCycle. Load drum loops or any audio, automatically slice them into equal-length segments, reorder them with drag-and-drop, and export your creative rearrangements.

## Features

- **Automatic Audio Slicing**: Load any audio file and automatically slice it into 4, 8, or 16 equal-length segments
- **Drag-and-Drop Reordering**: Intuitively reorder slices directly on the waveform display
- **Slice Management**: 
  - Delete unwanted slices
  - Duplicate slices to create variations
  - Click any slice to preview its audio
- **Visual Feedback**: Each slice gets a unique color and letter label (A, B, C, etc.) for easy identification
- **Playback Control**:
  - Play/pause the rearranged audio
  - Loop toggle for continuous playback
  - Volume control
  - Real-time playback position indicator
- **Export**: Download your rearranged beat as a WAV file with the original loop duration maintained
- **Randomisation Mode**:
  - **Shuffle**: Randomly reorder existing slices for instant variations
  - **Randomise**: Generate new slices with random segment positions throughout the audio for entirely new compositions

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Reusable component library
- **Framer Motion** - Animation library
- **React Hook Form** - Form state management
- **TanStack React Query** - Server state management
- **Wouter** - Lightweight routing

### Backend
- **Express.js** - Web server framework
- **Node.js** - Runtime environment
- **Web Audio API** - Audio processing and playback

### Build & Dev Tools
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type checking
- **TSX** - TypeScript executor for Node.js

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd beat-slicer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Development

1. **Start the development server**
   ```bash
   npm run dev
   ```
   This starts both the Vite frontend dev server and the Express backend on port 5000.

2. **Open in browser**
   Navigate to `http://localhost:5000` in your web browser.

### Building for Production

```bash
npm run build
```

This creates optimized production builds in the `dist` directory.

## Usage Guide

1. **Load Audio**: Click or drag an audio file (WAV, MP3, OGG, AIFF) into the upload area
2. **Configure Slices**: Choose the number of slices (4, 8, or 16) to divide the audio
3. **Preview Slices**: Click on any slice to hear just that segment
4. **Reorder**: Drag slices on the waveform to rearrange them in your desired order
5. **Refine**: Delete unwanted slices or duplicate slices for variation
6. **Randomise** (Optional):
   - **Shuffle**: Click the shuffle button to randomly reorder your current slices. Each click generates a new random arrangement
   - **Randomise**: Click the dice button to generate entirely new slices at random positions throughout the audio
   - Click **Done** to exit randomisation mode and return to normal editing
7. **Export**: Click Export to download your rearranged beat as a WAV file

## Project Structure

```
beat-slicer/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── utils/         # Utility functions
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.tsx        # Main app component
│   └── index.html         # HTML entry point
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── vite.ts           # Vite integration
├── shared/               # Shared types and schemas
└── package.json
```

## Audio Processing

The application uses the Web Audio API to:
- Decode audio files in multiple formats
- Extract audio waveform data for visualization
- Slice and rearrange audio buffers
- Export processed audio as WAV files

### Randomisation Algorithms

**Shuffle Mode**: Uses the Fisher-Yates shuffle algorithm to randomly reorder slices. This algorithm ensures a uniform distribution of possible arrangements, producing different results on each activation.

**Randomise Mode**: Generates new slices with independently random start positions within the audio duration. Each slice maintains its configured duration but starts at a pseudo-random point, allowing overlapping slices and creating entirely new compositional possibilities.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the Amen break beat slicing technique
- Built with the Propellerhead ReCycle workflow in mind
