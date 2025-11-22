# Beat Slicer - Audio Loop Rearrangement Tool

## Overview

Beat Slicer is a professional audio production utility for slicing, rearranging, and exporting drum loops and audio samples. Inspired by classic beat-slicing tools like Propellerhead ReCycle, the application allows users to upload audio files, automatically detect or manually create slice points, rearrange slices through an intuitive drag-and-drop interface, and export the rearranged audio. The tool is designed for music producers, DJs, and audio engineers who need to creatively manipulate rhythmic audio content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR (Hot Module Replacement)
- **Wouter** for lightweight client-side routing (single-page application with minimal routes)
- **TanStack Query** for server state management and API request handling

**UI Component System**
- **shadcn/ui** component library (New York style variant) providing pre-built, customizable components
- **Radix UI** primitives as the foundation for accessible, unstyled components
- **Tailwind CSS** for utility-first styling with custom design tokens
- **CVA (Class Variance Authority)** for managing component variants and conditional styling

**Design System**
- Dark mode-first interface optimized for professional audio work (follows DAW conventions)
- Custom color palette with HSL-based CSS variables for dynamic theming
- Professional color scheme: deep slate backgrounds, cyan accents for waveforms, purple for beat markers, amber for selections
- Typography: Inter for UI elements, JetBrains Mono for technical readouts and timecodes

**Audio Processing**
- **Web Audio API** for real-time audio playback and processing
- Custom `AudioProcessor` class handling buffer manipulation, slice extraction, and audio rearrangement
- Client-side audio analysis and waveform rendering using Canvas API
- Audio context management with gain nodes for volume control

**State Management**
- Local React state (useState, useRef) for UI and playback state
- Audio buffer and slice data managed in main component state
- No global state management library (complexity not warranted for this application)

### Backend Architecture

**Server Framework**
- **Express.js** as the HTTP server framework
- **Node.js** runtime with ESM (ES Modules) support
- Currently configured as a minimal API server (most logic is client-side)

**Development Tooling**
- **tsx** for running TypeScript in development mode
- **esbuild** for production server bundling
- Vite middleware integration for seamless development experience

**File Structure**
- `/server` - Backend code (routes, storage interface, server configuration)
- `/client` - Frontend React application
- `/shared` - Shared TypeScript types and schemas between client and server
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

**Current Implementation Note**
The application is primarily client-side focused, with audio processing happening entirely in the browser using the Web Audio API. The backend currently serves as a static file server and could be extended for features like cloud storage, user authentication, or preset management.

### Data Storage

**Database Configuration**
- **Drizzle ORM** configured for PostgreSQL database interactions
- **Neon Database** (@neondatabase/serverless) as the PostgreSQL provider
- Database schema defined in `/shared/schema.ts` with Zod validation

**Current Schema**
- Basic user table with username/password (authentication scaffold)
- Schema designed to be extensible for future features (saved presets, audio uploads, user projects)

**Storage Strategy**
- In-memory storage implementation (`MemStorage` class) for development/demo purposes
- Interface-based design (`IStorage`) allows swapping to database-backed storage without changing application logic
- Audio files processed entirely client-side (not persisted server-side in current implementation)

### External Dependencies

**UI Component Libraries**
- **Radix UI** - Complete suite of accessible, unstyled component primitives (dialogs, dropdowns, sliders, tooltips, etc.)
- **shadcn/ui** - Pre-configured component library built on Radix UI primitives
- **Lucide React** - Icon library for consistent iconography

**Styling & Design**
- **Tailwind CSS** - Utility-first CSS framework
- **tailwindcss-animate** - Animation utilities for Tailwind
- **class-variance-authority** - Type-safe component variant management
- **clsx & tailwind-merge** - Utility for conditional and merged class names

**Forms & Validation**
- **React Hook Form** - Performant form state management
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Integration between React Hook Form and Zod

**Audio & Media**
- **Web Audio API** (browser native) - Core audio processing
- **HTML5 Canvas API** (browser native) - Waveform visualization
- No external audio libraries required

**Development Tools**
- **Replit-specific plugins** - Vite plugins for Replit environment (error overlay, cartographer, dev banner)
- **TypeScript** - Static type checking across entire codebase
- **PostCSS** with Autoprefixer - CSS processing

**Database & ORM**
- **Drizzle ORM** - TypeScript ORM for PostgreSQL
- **Drizzle Kit** - Database migration and schema management tools
- **Drizzle Zod** - Integration for generating Zod schemas from Drizzle tables
- **@neondatabase/serverless** - Serverless PostgreSQL driver for Neon

**Utility Libraries**
- **nanoid** - Unique ID generation
- **date-fns** - Date manipulation utilities (though not heavily used in current implementation)