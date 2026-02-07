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

The canvas uses a **three-layer DOM structure** for infinite canvas feel with separate render layers:

- **Viewport**: Fixed-size container (`position: relative; overflow: hidden`) that handles user interactions and renders the infinite grid background
- **ContentWorld** (`canvas-world`): Transformable container (`position: absolute`) with CSS transform `scale(zoom) translate(...)`, holds canvas content (design elements) positioned at world coordinates. Content scales with zoom.
- **MetaOverlay** (`canvas-overlay`): Overlay container (`position: absolute; inset: 0; pointer-events: none`) that renders comment pins. Pins use `worldToViewport()` for positioning, pan with the camera but do NOT scale with zoom (constant screen size). Pins have `pointer-events: auto` to remain clickable.

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
- **Left click** (no drag) → create comment thread at world coordinates
- Use global `window` listeners for keyboard handling (space bar for pan mode)
- Implement drag threshold (~3px via `DRAG_THRESHOLD` constant) to separate clicks from pan gestures
- Zoom-at-cursor: capture world point under cursor, apply smooth exponential zoom (`Math.exp(-deltaY * ZOOM_SENSITIVITY)`), adjust camera to keep point fixed
- **Non-passive wheel listener**: Attached via `useEffect` with `{ passive: false }` to allow `preventDefault()` (React's `onWheel` registers passive listeners)
- Cursor state managed via React state (`CursorStyle` type), not direct DOM mutation

### Feature-Based Architecture

The application follows a **feature-based architecture** pattern where each feature is a self-contained vertical slice:

```
src/
├── features/     # Feature modules (canvas, comments, etc.)
└── shared/       # Shared utilities (no feature knowledge)
```

### Key Principles

1. **Feature Isolation**: Each feature contains all its code (components, hooks, store, types, tests)
2. **Pragmatic Cross-Feature Dependencies**: While features should ideally be isolated, pragmatic one-way dependencies are acceptable when features are tightly coupled (e.g., canvas importing comment store). The dependent feature (canvas) knows about the dependency (comments), but the dependency (comments) has no knowledge of the dependent feature.
3. **Shared Layer**: Contains only reusable code with no feature-specific knowledge

### Feature Structure

Each feature follows this structure:

```
features/[feature-name]/
├── components/   # Feature-specific UI components
├── hooks/        # Feature-specific hooks
├── store/        # Zustand store for feature state (when needed)
├── types/        # TypeScript types
├── utils/        # Utility functions (when needed)
└── __tests__/    # Feature tests
```

## Best Practices

### Code Organization

- **One feature per directory**: Keep features isolated
- **Barrel exports**: Use `index.ts` files for cleaner imports
- **Co-location**: Keep related code together (components with their tests)
- **Canvas utilities**: Pure functions (coordinate conversion, clamp) extracted to `utils/cameraUtils.ts` for reuse and testability
- **Interaction hooks**: Complex interaction logic extracted into custom hooks (e.g., `useCanvasInteraction`) to keep components slim and focused on rendering
- **DRY (Don't Repeat Yourself)**: Extract duplicated logic to shared utilities. If the same function appears in multiple files, move it to `shared/utils/` (e.g., `formatUtils.ts` for date formatting). This improves maintainability and ensures consistency across the codebase.

### Code Comments

- **No obvious comments**: Do not add comments that restate what the code already says. JSX section labels like `{/* Header */}`, `{/* Footer */}`, `{/* Comments list */}` are noise -- the code structure and element names make this clear.
- **Only explain "why"**: Comments are valuable when they explain _why_ something non-obvious is done (e.g., a counter-intuitive workaround, a measurement trick, or a constraint that isn't visible from the code alone).
- **Examples**:

```typescript
// ❌ Bad -- restates what the JSX already shows
{/* Header */}
<div className="border-b p-4">

// ❌ Bad -- obvious from the code
{/* Reply input */}
<textarea placeholder="Add a reply..." />

// ✅ Good -- explains a non-obvious technique
// Measure full content height for CSS transition target.
// Content is always rendered (at full width) but clipped by overflow:hidden.
useLayoutEffect(() => { ... })

// ✅ Good -- explains a constraint
// Anchor at bottom-left corner (where the pointer is)
transform: 'translate(0, -100%)',
```

### Naming Conventions

- **Components**: PascalCase (e.g., `Canvas.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useCanvas.ts`)
- **Stores**: camelCase ending with "Store" (e.g., `useEditorStore.ts`)
- **Types**: PascalCase interfaces/types (e.g., `Camera`, `CommentThread`)
- **Files**: Match export name for single-export files (e.g., `Canvas.tsx` exports `Canvas`)
- **Utility files**: camelCase, descriptive domain name (e.g., `cameraUtils.ts` for camera/coordinate utilities, `formatUtils.ts` for formatting utilities)

### Import Patterns

Use path aliases for cleaner imports:

```typescript
// ✅ Good
import { Canvas } from '@/features/canvas/components/Canvas'
import { formatRelativeTime } from '@/shared/utils/formatUtils'

// ❌ Bad
import { Canvas } from '../../../features/canvas/components/Canvas'
```

### State Management

- **Feature-level state**: Use Zustand stores in `features/[name]/store/` when needed
- **Component state**: Use `useState`/`useRef` for local component state
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
  it('creates comment thread on click', async () => {
    const user = userEvent.setup()
    render(<Canvas />)
    const viewport = screen.getByTestId('canvas-viewport')

    // Use userEvent.pointer() for coordinate-based interactions
    await user.pointer([
      { target: viewport, coords: { clientX: 400, clientY: 300 } },
      { keys: '[MouseLeft]' },
    ])

    await waitFor(() => {
      expect(screen.getAllByTestId('comment-pin').length).toBeGreaterThan(0)
    })
  })
})
```

### Test Coverage

- Aim for high coverage of business logic
- Pure functions first (coordinate conversion, clamp) -- highest value, no mocking needed
- Hook behavior second (camera state transitions, cursor changes) -- use `renderHook`
- Component rendering third (smoke tests, DOM structure) -- use `render`
- Use React Testing Library queries (getByRole, getByText, getByTestId, etc.)
- Use `data-testid` attributes for structural elements that lack accessible roles

### Avoid Testing Implementation Details

**This is a core principle.** Tests should verify _what_ the component does, not _how_ it's styled or structured internally. Tests coupled to implementation details break on refactors that don't change behavior.

**Never query by CSS class names** (Tailwind or otherwise):

```typescript
// ❌ Bad -- coupled to Tailwind classes, breaks if styling changes
const badge = document.querySelector('.bg-green-100.text-green-800')
const rects = world.querySelectorAll('.bg-blue-500, .bg-green-500')
const list = document.querySelector('.divide-y')

// ✅ Good -- query by semantic attributes that express meaning
const badge = screen.getByTestId('thread-status-badge')
const rects = screen.getAllByTestId('demo-rect')
const item = screen.getByTestId('thread-item')
```

**Use semantic `data-*` attributes for visual state** instead of asserting on CSS classes:

```typescript
// ❌ Bad -- checks Tailwind class for "resolved" visual
const greenBg = pin.querySelector('.bg-green-500')
expect(greenBg).toBeInTheDocument()

// ✅ Good -- checks semantic state via data attribute
expect(pin).toHaveAttribute('data-resolved', 'true')
```

**Prefer accessible queries** (`getByRole`, `getByText`, `getByLabelText`, `getByPlaceholderText`, `getByDisplayValue`) over `querySelector` whenever possible. Fall back to `getByTestId` only when no accessible query fits.

**What to test in component tests:**

- Rendered text content and structure (via accessible queries)
- User interaction outcomes (click → callback called, type → state changes)
- Conditional rendering (empty states, loading, error)
- Semantic state (`data-*` attributes for resolved/selected/active)

**What NOT to test:**

- CSS class names (Tailwind, BEM, or any styling classes)
- Internal DOM structure or nesting depth
- Specific HTML tag choices (unless semantically meaningful)
- Animation or transition implementation
- **React import in tests**: Even with `jsx: "react-jsx"`, TypeScript requires `import React from 'react'` in test files for JSX type resolution
- **Coordinate-based interactions**: Use `userEvent.pointer()` with `coords` for canvas/coordinate-based clicks, not `userEvent.click()` (which doesn't accept coordinates)
- **RefObject types**: `useRef<T>(null)` returns `RefObject<T | null>` - interface types should match this (e.g., `React.RefObject<HTMLDivElement | null>`)
- **Mocking Zustand stores in tests**: When mocking Zustand stores with `vi.mock()`, create complete mock state objects that match the store type exactly. Use `Object.assign()` to attach `getState()` static method. For type imports in test files, prefer relative imports over path aliases to avoid IDE language server resolution issues with mocked modules.
- **Path aliases in test files**: TypeScript language server can have trouble resolving path aliases (`@/features/...`) in test files when the same module path is mocked. Use relative imports for type-only imports in test files to ensure reliable IDE support.
- **Type-only imports**: When importing types from barrel exports in test files with mocks, use relative imports (e.g., `../../comments/store/useEditorStore`) instead of path aliases to avoid resolution conflicts between the mock and the type import.

## Codebase Overview

### Features

#### Canvas Feature (`src/features/canvas/`)

The main canvas feature for Miro-like functionality:

- **Components**: `Canvas.tsx` - Slim render-only component; renders viewport with ContentWorld layer (scales with zoom) and MetaOverlay layer (constant size), grid background, demo objects, comment pins, and zoom indicator. All interaction logic is delegated to the `useCanvasInteraction` hook.
- **Hooks**: `useCanvasInteraction.ts` - Core interaction hook: manages camera state, cursor state, trackpad pan/zoom (non-passive wheel listener with `ctrlKey` detection), space+drag pan, middle-mouse pan, click-to-create-thread, and smooth camera focus animation. Integrates with comment editor store for thread creation and camera focus.
- **Utils**: `cameraUtils.ts` - Pure functions (`viewportToWorld`, `worldToViewport`, `clamp`) and constants (`GRID_SIZE`, `MIN_ZOOM`, `MAX_ZOOM`, `DRAG_THRESHOLD`, `ZOOM_SENSITIVITY`)
- **Types**: `Camera` - Canvas type definitions
- **Tests**: `cameraUtils.test.ts` (33 pure function tests), `useCanvasInteraction.test.ts` (hook behavior tests with mocked editor store), `Canvas.test.tsx` (component tests including integration) - tests updated to reflect comment system integration
- **Cross-Feature Dependency**: Canvas imports `useEditorStore` from `@/features/comments/store` for thread creation and camera focus coordination

**Canvas File Structure**:

```
features/canvas/
├── components/
│   └── Canvas.tsx              # Slim render-only component
├── hooks/
│   └── useCanvasInteraction.ts # Pan, zoom, pointer, keyboard logic + comment integration
├── utils/
│   └── cameraUtils.ts          # Pure functions and constants
├── types/
│   └── index.ts                # Camera
└── __tests__/
    ├── cameraUtils.test.ts     # Pure function tests (33 tests)
    ├── useCanvasInteraction.test.ts  # Hook behavior tests (with mocked editor store)
    └── Canvas.test.tsx         # Component tests: smoke + integration
```

#### Comments Feature (`src/features/comments/`)

A complete comment thread system integrated with the canvas:

- **Components**:
  - `CommentPin.tsx` - Speech bubble-shaped pin marker positioned in MetaOverlay layer using `worldToViewport()` conversion, clickable, shows hover tooltip with thread preview. Pins pan with camera but maintain constant screen size (do not scale with zoom). Accepts `camera` prop for viewport coordinate calculation.
  - `ThreadPanel.tsx` - Thread detail view: metadata, comment list with inline editing, reply input, resolve toggle
  - `ThreadList.tsx` - Filterable list of all threads (open/resolved/all) with click-to-focus animation
  - `SidePanel.tsx` - Container component that switches between ThreadList and ThreadPanel based on selection
- **Store**: `useEditorStore.ts` - Zustand store managing threads, selectedThreadId, filter, focusTarget state and all CRUD actions
- **Types**: `Comment`, `CommentThread` - Comment system type definitions
- **Tests**: `useEditorStore.test.ts` (store action tests), `CommentPin.test.tsx` (component tests)
- **Integration**: Canvas feature imports comment store for thread creation; App.tsx renders SidePanel alongside Canvas

**Comments File Structure**:

```
features/comments/
├── components/
│   ├── CommentPin.tsx          # Speech bubble pin with hover tooltip
│   ├── ThreadPanel.tsx         # Thread detail view
│   ├── ThreadList.tsx          # Filterable thread list
│   ├── SidePanel.tsx           # Container (list or panel)
│   └── index.ts                # Barrel export
├── store/
│   ├── useEditorStore.ts       # Zustand store (EditorStore type exported)
│   └── index.ts                # Barrel export
├── types/
│   └── index.ts                # Comment, CommentThread
└── __tests__/
    ├── useEditorStore.test.ts  # Store tests
    └── CommentPin.test.tsx      # Component tests
```

### Shared Utilities

#### Utilities (`src/shared/utils/`)

- **formatUtils.ts**: Date formatting utilities (`formatRelativeTime`)

### App Structure

- **App.tsx**: Main app component with layout
- **main.tsx**: Application entry point

## Technology Stack

- **React 19** with React Compiler
- **TypeScript** (strict mode)
- **Vite** for building
- **Tailwind CSS** for styling
- **Vitest** for testing
- **Zustand** for state management
- **ESLint** + **Prettier** for code quality

## Development Workflow

1. Create feature in `src/features/[feature-name]/`
2. Add components, hooks, store (when needed), types, utils (when needed), tests
3. Use path aliases for imports
4. Write tests alongside code
5. Follow established patterns
6. Update this documentation when patterns change
