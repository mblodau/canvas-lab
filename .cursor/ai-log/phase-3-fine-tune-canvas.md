# Phase 3: Fine-Tune Canvas - Multi-Touch, Code Quality, and Unit Tests

## Overview

Refine the canvas with cross-platform trackpad multi-touch support (macOS, Windows, Linux), improve code quality by extracting logic into testable units, and add meaningful unit tests for pure functions and interaction hooks.

## Objectives

1. Add trackpad multi-touch support (two-finger pan, pinch-to-zoom)
2. Improve code quality through refactoring and extraction
3. Add comprehensive unit tests following best practices

---

## 1. Trackpad Multi-Touch Support

### Problem

The current `handleWheel` in `Canvas.tsx` treats **all** wheel events as zoom. On all desktop OSes, trackpads generate different wheel events depending on the gesture:

- **Two-finger scroll** produces `deltaX`/`deltaY` **without** `ctrlKey`
- **Pinch-to-zoom** produces `deltaY` **with** `ctrlKey` set to `true`

### Solution

This `ctrlKey` convention is a **browser standard** -- it works identically across:

- **macOS** trackpads (Chrome, Safari, Firefox)
- **Windows** precision touchpads (Chrome, Edge, Firefox)
- **Linux** precision touchpads on Wayland/X11 (Chrome, Firefox)

The fix is straightforward -- check `e.ctrlKey` in the wheel handler to distinguish pan from zoom:

```typescript
// Pinch-to-zoom (ctrlKey is true for trackpad pinch on all desktop OSes)
if (e.ctrlKey) {
  // zoom logic (existing)
} else {
  // Two-finger pan: use deltaX/deltaY to move camera
  setCamera(prev => ({
    ...prev,
    x: prev.x + e.deltaX / prev.zoom,
    y: prev.y + e.deltaY / prev.zoom,
  }))
}
```

### Important Implementation Details

**Non-passive wheel listener**: React's synthetic `onWheel` registers a passive listener by default, which means `e.preventDefault()` won't work. We need to attach the wheel handler via `useEffect` with `{ passive: false }` to properly prevent page scrolling during canvas zoom.

### Additional Trackpad Refinements

- **Pinch-to-zoom via trackpad**: Already handled by the `ctrlKey` check above -- trackpad pinch events set `ctrlKey: true` and use `deltaY` for zoom amount. We should use a smoother zoom factor based on actual delta magnitude instead of a fixed 0.9/1.1 step.
- **Smooth zoom scaling**: Replace the fixed `0.9/1.1` factor with `Math.exp(-deltaY * sensitivity)` for a proportional, buttery-smooth zoom feel that matches finger velocity.
- **Inertia-friendly panning**: Trackpads generate momentum events after finger lift. The current architecture already supports this naturally since each wheel event updates camera incrementally -- no changes needed, just no damping.
- **Mobile/tablet**: Deferred to a future iteration (would require multi-pointer touch tracking)

---

## 2. Code Quality Improvements

### Issues Identified

| Issue                                                         | Fix                                                         |
| ------------------------------------------------------------- | ----------------------------------------------------------- |
| **Monolithic component** (254 lines, all logic inline)        | Extract interaction logic into `useCanvasInteraction` hook  |
| **Direct DOM mutation** (`style.cursor = ...`)                | Use React state for cursor, render via className/style      |
| **Commented-out code** (`worldToViewport` on lines 28-39)     | Remove or export properly if not needed                     |
| **Non-passive wheel listener** (`onWheel` + `preventDefault`) | Attach via `useEffect` with `{ passive: false }`            |
| **Weak ID generation** (`Date.now()-Math.random()`)           | Use `crypto.randomUUID()`                                   |
| **Pure functions inline** (`viewportToWorld`, `clamp`)        | Extract to `utils/cameraUtils.ts` for reuse and testability |
| **Hard-coded demo objects** (rectangles)                      | Separate demo content from canvas component                 |

### Proposed File Structure After Refactoring

```
features/canvas/
├── components/
│   ├── Canvas.tsx              # Slim component, renders viewport/world
│   └── CrosshairMarker.tsx    # Crosshair marker component
├── hooks/
│   └── useCanvasInteraction.ts # Pan, zoom, and pointer interaction logic
├── utils/
│   └── cameraUtils.ts          # viewportToWorld, worldToViewport, clamp, etc.
├── __tests__/
│   ├── cameraUtils.test.ts     # Pure function tests
│   ├── useCanvasInteraction.test.ts  # Hook behavior tests
│   ├── Canvas.test.tsx         # Component smoke + integration tests
│   └── CrosshairMarker.test.tsx # Component tests
└── types/
    └── index.ts                # Camera, Crosshair interfaces
```

---

## 3. Unit Tests

The testing infrastructure (Vitest + Testing Library + jsdom) is already configured, but no test files exist yet.

### Test Targets (Ordered by Value)

#### Pure Function Tests (`cameraUtils.test.ts`) - Highest Value

Zero mocking needed, highest test value:

- `viewportToWorld`: various camera positions, zoom levels, negative coords
- `worldToViewport`: inverse of above
- `clamp`: edge cases (at min, at max, within range, inverted min/max)
- `getViewportCoordinates`: coordinate extraction from events
- `squaredDistance`: distance calculation optimization
- `getGridStyle`: grid style generation

#### Interaction Hook Tests (`useCanvasInteraction.test.ts`)

Using `renderHook` from Testing Library:

- Two-finger scroll (wheel without ctrlKey) updates camera.x/y
- Pinch-to-zoom (wheel with ctrlKey) updates camera.zoom
- Zoom clamps within `[0.25, 3.0]`
- Space+drag triggers pan mode
- Click (no drag) places crosshair at correct world coordinates
- Drag beyond threshold does not place crosshair
- Cursor state changes (grab, grabbing, default)

#### Component Tests

**Canvas.test.tsx** - Smoke tests + integration tests:

- Canvas renders viewport and world containers
- Zoom indicator displays correct percentage
- User interactions: click to place crosshair, pan, zoom

**CrosshairMarker.test.tsx** - Component tests:

- Renders at correct world coordinates
- Is visible to users
- Doesn't block pointer events
- Renders at different positions

---

## Summary of Touchpad-Specific Suggestions

1. **Two-finger pan** (the main ask) -- distinguish `ctrlKey` wheel events (cross-platform browser standard)
2. **Pinch-to-zoom** -- works naturally via the same `ctrlKey` detection (macOS, Windows, Linux)
3. **Smooth zoom** -- use `Math.exp(-delta * sensitivity)` instead of fixed step
4. **Non-passive wheel** -- required for `preventDefault()` to work in all browsers
5. **Momentum support** -- already works with incremental camera updates (no blocking needed)
6. **Mobile/tablet** -- deferred to a future iteration (would require multi-pointer touch tracking)

---

## Implementation Status

✅ **Completed**: All objectives achieved

- ✅ Trackpad multi-touch support implemented (two-finger pan, pinch-to-zoom)
- ✅ Code quality improvements (extracted utilities, hooks, components)
- ✅ Comprehensive unit tests added (65 tests total)
- ✅ Tests refactored to follow best practices (user-facing behavior vs implementation details)
- ✅ Naming conventions standardized (utility files to camelCase)
- ✅ Documentation updated

### Final Test Coverage

- **Pure function tests**: 33 tests (`cameraUtils.test.ts`)
- **Hook behavior tests**: 18 tests (`useCanvasInteraction.test.ts`)
- **Component tests**: 14 tests (`Canvas.test.tsx` - 9 tests, `CrosshairMarker.test.tsx` - 5 tests)
- **Total**: 65 tests across 4 test files

### Code Quality Metrics

- **Canvas.tsx**: Reduced from 254 lines to 55 lines (-78%)
- **Code duplication**: Eliminated 4 instances of viewport coordinate calculation
- **New utilities**: 6 helper functions extracted (`getViewportCoordinates`, `squaredDistance`, `getGridStyle`, plus existing `viewportToWorld`, `worldToViewport`, `clamp`)
- **New components**: 1 (`CrosshairMarker`)
- **New hooks**: 1 (`useCanvasInteraction`)
