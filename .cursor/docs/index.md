# Developer Documentation

## Project Purpose

**Canvas Lab** is a Miro-like canvas-based web application for experimenting with canvas-based interactions and features. The project serves as a laboratory for building and testing canvas functionality using modern React and TypeScript tooling.

### Goals

- Provide a foundation for canvas-based web applications
- Demonstrate feature-based architecture patterns
- Showcase modern React development practices
- Enable rapid experimentation with canvas features

## Design Patterns

### Canvas Architecture

The canvas uses a **two-layer DOM structure** for infinite canvas feel:

- **Viewport**: Fixed-size container (`position: relative; overflow: hidden`) that handles user interactions and renders the infinite grid background
- **World**: Transformable container (`position: absolute`) with CSS transform, holds canvas content positioned at world coordinates

**Camera Model**: `camera.x/y` represents the world coordinate visible at the viewport's top-left corner. `camera.zoom` is the scale factor (1.0 = 100%).

**Coordinate Conversion**:

- `viewportToWorld(viewportX, viewportY, camera)` - Converts viewport coordinates to world coordinates
- `worldToViewport(worldX, worldY, camera)` - Converts world coordinates to viewport coordinates (useful for UI overlays)

**CSS Transform**: `transform: scale(zoom) translate(-camera.x px, -camera.y px)` with `transformOrigin: '0 0'`

**Why This Feels Infinite**:

- World div has no fixed dimensions - objects render at any coordinate
- Grid background is on viewport (not world) so it always fills the screen
- No pan clamping - camera can move to any x/y value
- Viewport uses `overflow: hidden` (no scroll bars)

**Interaction Patterns** (cross-platform trackpad support: macOS, Windows, Linux):

- **Trackpad two-finger scroll** → pan camera (wheel event without `ctrlKey`)
- **Trackpad pinch-to-zoom** → smooth zoom at cursor (wheel event with `ctrlKey`, browser standard across all desktop OSes)
- **Space + drag** or **middle mouse drag** → pan mode via Pointer Events (`onPointerDown`, `onPointerMove`, `onPointerUp`) with `setPointerCapture`
- **Left click** (no drag) → place crosshair at world coordinates
- Use global `window` listeners for keyboard handling (space bar for pan mode)
- Implement drag threshold (~3px via `DRAG_THRESHOLD` constant) to separate clicks from pan gestures
- Zoom-at-cursor: capture world point under cursor, apply smooth exponential zoom (`Math.exp(-deltaY * ZOOM_SENSITIVITY)`), adjust camera to keep point fixed
- **Non-passive wheel listener**: Attached via `useEffect` with `{ passive: false }` to allow `preventDefault()` (React's `onWheel` registers passive listeners)
- Cursor state managed via React state (`CursorStyle` type), not direct DOM mutation

### Feature-Based Architecture

The application follows a **feature-based architecture** pattern where each feature is a self-contained vertical slice:

```
src/
├── app/          # App shell (routing, providers, layout)
├── features/     # Feature modules (canvas, etc.)
├── shared/       # Shared utilities and UI (no feature knowledge)
└── entities/     # Domain objects shared across features
```

### Key Principles

1. **Feature Isolation**: Each feature contains all its code (components, hooks, store, API, types, tests)
2. **No Cross-Feature Imports**: Features should not import from other features directly
3. **Shared Layer**: Contains only reusable code with no feature-specific knowledge
4. **App Layer**: Contains app-level concerns (routing, providers, layout)

### Feature Structure

Each feature follows this structure:

```
features/[feature-name]/
├── components/   # Feature-specific UI components
├── hooks/        # Feature-specific hooks
├── store/        # Zustand store for feature state
├── api/          # API calls for this feature
├── types/        # TypeScript types
└── __tests__/    # Feature tests
```

## Best Practices

### Code Organization

- **One feature per directory**: Keep features isolated
- **Barrel exports**: Use `index.ts` files for cleaner imports
- **Co-location**: Keep related code together (components with their tests)
- **Canvas utilities**: Pure functions (coordinate conversion, clamp) extracted to `utils/cameraUtils.ts` for reuse and testability
- **Interaction hooks**: Complex interaction logic extracted into custom hooks (e.g., `useCanvasInteraction`) to keep components slim and focused on rendering

### Naming Conventions

- **Components**: PascalCase (e.g., `Canvas.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useCanvas.ts`)
- **Stores**: camelCase ending with "Store" (e.g., `useCanvasStore.ts`)
- **Types**: PascalCase interfaces/types (e.g., `CanvasItem`)
- **Files**: Match export name for single-export files (e.g., `Canvas.tsx` exports `Canvas`)
- **Utility files**: camelCase, descriptive domain name (e.g., `cameraUtils.ts` for camera/coordinate utilities, `formatUtils.ts` for formatting utilities)

### Import Patterns

Use path aliases for cleaner imports:

```typescript
// ✅ Good
import { Canvas } from '@/features/canvas/components/Canvas'
import { Button } from '@/shared/ui'

// ❌ Bad
import { Canvas } from '../../../features/canvas/components/Canvas'
```

### State Management

- **Feature-level state**: Use Zustand stores in `features/[name]/store/`
- **Global app state**: Use Zustand in `app/providers/` if needed
- **Component state**: Use `useState` for local component state
- **Server state**: Consider React Query or similar for server state
- **Prototyping/Hello-world**: For initial implementations and proof-of-concepts, inline `useState`/`useRef` is acceptable. Migrate to Zustand when patterns stabilize.

## Testing Guidelines

### Test Structure

- Tests live in `__tests__/` directories within features
- Use descriptive test names: `describe('FeatureName', () => { ... })`
- Group related tests together

### Testing Patterns

**Pure function tests** (highest value, zero mocking):

```typescript
import { describe, it, expect } from 'vitest'

import { clamp, viewportToWorld } from '../utils/cameraUtils'

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })
})
```

**Hook tests** (using `renderHook` and `act` from Testing Library):

```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { useCanvasInteraction } from '../hooks/useCanvasInteraction'

describe('useCanvasInteraction', () => {
  it('starts with camera at origin', () => {
    const { result } = renderHook(() => useCanvasInteraction())
    expect(result.current.camera).toEqual({ x: 0, y: 0, zoom: 1 })
  })
})
```

**Component smoke tests** (render and query):

```typescript
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, it, expect } from 'vitest'

import { Canvas } from '../components/Canvas'

describe('Canvas', () => {
  it('renders the viewport', () => {
    render(<Canvas />)
    expect(screen.getByTestId('canvas-viewport')).toBeInTheDocument()
  })
})
```

**Component integration tests** (user interactions):

```typescript
import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, it, expect } from 'vitest'

import { Canvas } from '../components/Canvas'

describe('Canvas interactions', () => {
  it('places crosshair on click', async () => {
    const user = userEvent.setup()
    render(<Canvas />)
    const viewport = screen.getByTestId('canvas-viewport')

    // Use userEvent.pointer() for coordinate-based interactions
    await user.pointer([
      { target: viewport, coords: { clientX: 400, clientY: 300 } },
      { keys: '[MouseLeft]' },
    ])

    await waitFor(() => {
      expect(screen.getAllByTestId('crosshair-marker').length).toBeGreaterThan(0)
    })
  })
})
```

### MSW Usage

- Define handlers in `tests/mocks/handlers.ts`
- Use `setupServer` from `msw/node` for tests
- Mock API calls at the network level, not component level

### Test Coverage

- Aim for high coverage of business logic
- Pure functions first (coordinate conversion, clamp) -- highest value, no mocking needed
- Hook behavior second (camera state transitions, cursor changes) -- use `renderHook`
- Component rendering third (smoke tests, DOM structure) -- use `render`
- Test user interactions, not implementation details
- Use React Testing Library queries (getByRole, getByText, getByTestId, etc.)
- Use `data-testid` attributes for structural elements that lack accessible roles
- **React import in tests**: Even with `jsx: "react-jsx"`, TypeScript requires `import React from 'react'` in test files for JSX type resolution
- **Coordinate-based interactions**: Use `userEvent.pointer()` with `coords` for canvas/coordinate-based clicks, not `userEvent.click()` (which doesn't accept coordinates)
- **RefObject types**: `useRef<T>(null)` returns `RefObject<T | null>` - interface types should match this (e.g., `React.RefObject<HTMLDivElement | null>`)

## Codebase Overview

### Features

#### Canvas Feature (`src/features/canvas/`)

The main canvas feature for Miro-like functionality:

- **Components**: `Canvas.tsx` - Slim render-only component; renders viewport/world structure, grid background, demo objects, crosshairs, and zoom indicator. All interaction logic is delegated to the `useCanvasInteraction` hook.
- **Hooks**:
  - `useCanvasInteraction.ts` - Core interaction hook: manages camera state, crosshair placement, cursor state, trackpad pan/zoom (non-passive wheel listener with `ctrlKey` detection), space+drag pan, middle-mouse pan, and click-to-place.
  - `useCanvas.ts` - Canvas feature hook (placeholder, uses Zustand store)
- **Utils**: `cameraUtils.ts` - Pure functions (`viewportToWorld`, `worldToViewport`, `clamp`) and constants (`GRID_SIZE`, `MIN_ZOOM`, `MAX_ZOOM`, `DRAG_THRESHOLD`, `ZOOM_SENSITIVITY`)
- **Store**: `useCanvasStore.ts` - Canvas state management (placeholder, currently using inline state in hook)
- **Types**: `Camera`, `Crosshair`, `CanvasItem` - Canvas type definitions
- **Tests**: `cameraUtils.test.ts` (33 pure function tests), `useCanvasInteraction.test.ts` (18 hook behavior tests), `Canvas.test.tsx` (9 component tests including integration), `CrosshairMarker.test.tsx` (5 component tests) - **65 tests total**
- **API**: Placeholder API functions for canvas data

**Canvas File Structure**:

```
features/canvas/
├── components/
│   ├── Canvas.tsx              # Slim render-only component
│   └── CrosshairMarker.tsx    # Crosshair marker component
├── hooks/
│   ├── useCanvasInteraction.ts # Pan, zoom, pointer, keyboard logic
│   └── useCanvas.ts            # Zustand store hook (placeholder)
├── utils/
│   └── cameraUtils.ts          # Pure functions and constants
├── __tests__/
│   ├── cameraUtils.test.ts     # Pure function tests (33 tests)
│   ├── useCanvasInteraction.test.ts  # Hook behavior tests (18 tests)
│   ├── Canvas.test.tsx         # Component tests: smoke + integration (9 tests)
│   └── CrosshairMarker.test.tsx # Component tests (5 tests)
├── store/
│   ├── useCanvasStore.ts
│   └── index.ts
├── types/
│   └── index.ts                # Camera, Crosshair, CanvasItem
└── api/
    └── index.ts
```

### Shared Components

#### UI Components (`src/shared/ui/`)

- **Button**: Reusable button component with variants

### App Structure

- **App.tsx**: Main app component with layout
- **main.tsx**: Application entry point

## Technology Stack

- **React 19** with React Compiler
- **TypeScript** (strict mode)
- **Vite** for building
- **Tailwind CSS** for styling
- **Vitest** for testing
- **MSW** for API mocking
- **Zustand** for state management
- **ESLint** + **Prettier** for code quality

## Development Workflow

1. Create feature in `src/features/[feature-name]/`
2. Add components, hooks, store, API, types, tests
3. Use path aliases for imports
4. Write tests alongside code
5. Follow established patterns
6. Update this documentation when patterns change
