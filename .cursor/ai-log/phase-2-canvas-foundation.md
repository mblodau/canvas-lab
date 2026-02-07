# Hello World DOM Canvas Implementation

## Overview

Create a foundational DOM-based canvas implementation that demonstrates pan/zoom functionality and correct coordinate conversion. This is a proof-of-concept for the canvas system.

## Architecture

The canvas uses a two-layer DOM structure designed to feel like an infinite canvas:

- **Viewport div**: Fixed-size container (`position: relative; overflow: hidden`), handles user interactions (pan, zoom, clicks). Renders the **dot grid background** via CSS `background-image` so the pattern always fills the entire visible area regardless of pan/zoom position.
- **World div**: Transformable child (`position: absolute`), holds canvas content, positioned via CSS transform. Has **no fixed width/height** and **no overflow clipping** -- it's just an anchor point for the transform. Children are `position: absolute` with `left`/`top` at their world coordinates. The viewport's `overflow: hidden` clips what's off-screen.

### Why This Feels Infinite

1. **No world boundaries**: The world div has no dimensions to "hit." Objects are absolutely positioned and render at any coordinate. Pan to (50000, 80000) and it still works -- objects just get clipped by the viewport when off-screen.
2. **Grid on the viewport, not the world**: The dot grid is a CSS background on the viewport div with `backgroundSize` and `backgroundPosition` computed from camera state. Since the viewport always fills the screen, dots are always visible everywhere -- no edges, no gaps.
3. **No pan clamping**: Camera can move to any x/y value without restriction.
4. **No scroll bars**: Viewport uses `overflow: hidden`, not `overflow: auto`.

### Camera Model

`camera.x` / `camera.y` = the **world coordinate visible at the viewport's top-left corner**.
`camera.zoom` = scale factor (1.0 = 100%).

This model is the standard for canvas editors because everything is stored in world coordinates and conversions are simple.

### Coordinate Conversions

```
viewportToWorld:
  worldX = camera.x + viewportX / camera.zoom
  worldY = camera.y + viewportY / camera.zoom

worldToViewport:
  viewportX = (worldX - camera.x) * camera.zoom
  viewportY = (worldY - camera.y) * camera.zoom
```

### CSS Transform

With `transformOrigin: '0 0'`, the correct CSS transform order is:

```
transform: scale(zoom) translate(-camera.x px, -camera.y px)
```

**Why this order matters**: CSS composes transforms left-to-right as matrix multiplication (right operand applied first to the element). `scale(z) translate(-cx, -cy)` means: first translate the element by `(-cx, -cy)` in world units, then scale around origin. This produces `(z*(wx - cx), z*(wy - cy))` which matches `worldToViewport`.

The alternative `translate(-cx, -cy) scale(z)` produces `(z*wx - cx, z*wy - cy)` -- only correct at zoom=1.

## Implementation Details

### 1. File: `src/features/canvas/components/Canvas.tsx`

Replace the placeholder with the full implementation. Everything lives in this single component for now.

### 2. State (Temporary Inline)

Use `useState` for reactive state, `useRef` for non-reactive interaction tracking:

- `camera` (useState): `{ x: number, y: number, zoom: number }` -- initial `{ x: 0, y: 0, zoom: 1 }`
- `crosshairs` (useState): `Array<{ id: string, x: number, y: number }>`
- `isPanning` (useRef): whether a pan gesture is active
- `panStart` (useRef): `{ x: number, y: number }` -- viewport coords where pan started
- `pointerStart` (useRef): `{ x: number, y: number }` -- to detect drag vs click (threshold)
- `spacePressed` (useRef): whether space key is held (for space+click panning)

### 3. Zoom at Cursor

When the wheel fires at viewport point `(sx, sy)`:

```
const before = viewportToWorld(sx, sy, camera)
const factor = e.deltaY > 0 ? 0.9 : 1.1
const newZoom = clamp(camera.zoom * factor, 0.25, 3.0)

// Adjust camera so world point stays under cursor
camera.x = before.x - sx / newZoom
camera.y = before.y - sy / newZoom
camera.zoom = newZoom
```

This produces Figma-like zoom behavior.

### 4. Panning

Use **Pointer Events** (`onPointerDown`, `onPointerMove`, `onPointerUp`) with `setPointerCapture` to avoid stuck-drag when the cursor leaves the viewport.

On pointer move with active pan, given screen delta `(dx, dy)`:

```
camera.x -= dx / camera.zoom
camera.y -= dy / camera.zoom
```

Drag right (dx > 0) -> camera.x decreases -> content moves right. Correct.

### 5. Click vs Pan Gesture Separation

Left click serves two purposes depending on intent:

- **Click** (pointer didn't move > 3px): place crosshair at computed world coordinates
- **Pan** (space held + left drag, or middle mouse drag): pan the canvas

On `pointerDown`: record `pointerStart = { x, y }`.
On `pointerUp`: compute distance from `pointerStart`. If < 3px and not a pan gesture, place crosshair.

### 6. Visual Elements

- **Rectangle (positive coords)**: `absolute` div at world position `{x: 500, y: 300}`, styled with Tailwind (blue)
- **Rectangle (negative coords)**: Second `absolute` div at world position `{x: -200, y: -150}`, styled differently (green). Proves the canvas is truly infinite in all directions, including negative coordinates.
- **Crosshairs**: Rendered from `crosshairs` array, each positioned at its world coords using `left`/`top` + a CSS cross shape
- **Zoom indicator**: Fixed to viewport (not inside world div), shows `Math.round(zoom * 100)%`
- **Dot grid background**: Applied to the **viewport div** (not the world div) so it always fills the screen. Computed dynamically from camera state:
  ```
  backgroundImage: radial-gradient(circle, #ccc 1px, transparent 1px)
  backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`
  backgroundPosition: `${-camera.x * zoom}px ${-camera.y * zoom}px`
  ```
  where `gridSize` is a constant (e.g., 20px in world units). The grid pans and scales with content, creating an infinite canvas feel.

### 7. Keyboard Handling

- Attach `keydown`/`keyup` listeners on `window` inside a `useEffect` (with cleanup). A div won't reliably receive key events unless focused, and managing focus is fragile. Global listeners are the standard approach for canvas/editor UIs.
- Track space bar state in `spacePressed` ref
- Space + left drag = pan mode (cursor changes to grab/grabbing)
- Prevent default on space to avoid page scroll

## File Changes

### Modified Files

- `src/features/canvas/components/Canvas.tsx` -- replace placeholder with full implementation

No new files needed for the hello-world phase. Coordinate utils are inline.

## Implementation Checklist

- [x] Create viewport and world div structure in Canvas component with CSS grid background
- [x] Add camera state { x, y, zoom } and interaction refs (isPanning, panStart, pointerStart) using useState/useRef
- [x] Implement viewportToWorld and worldToViewport coordinate conversion functions
- [x] Add wheel handler for zoom-at-cursor with clamping (0.25-3.0)
- [x] Implement pointer event handlers for panning (middle button or space+left) with setPointerCapture
- [x] Add click handler with drag threshold (~3px) to separate click from pan gesture
- [x] Render rectangles at {x: 500, y: 300} and {x: -200, y: -150}, crosshairs array, and zoom indicator
- [x] Apply Tailwind CSS styling to all canvas elements

## Testing Considerations

- Rectangle at (500,300) appears at correct viewport position after pan/zoom
- Rectangle at (-200,-150) is reachable by panning into negative coords, proves infinite in all directions
- Crosshair appears exactly where you click (world coords match)
- Panning moves content in the correct direction, scaled by zoom
- Zoom-at-cursor keeps the world point under the cursor fixed
- Zoom indicator updates correctly
- No stuck-drag when pointer leaves viewport (pointer capture)
- Click doesn't fire after a pan gesture (threshold works)
- Dot grid is always visible, moves/scales with content, has no visible edges

## Future Enhancements (Out of Scope)

- Move state to Zustand store
- Extract coordinate utils to `src/features/canvas/utils/`
- Keyboard shortcuts (fit to screen, reset zoom)
- Smooth zoom animation (lerp)
- Touch / multi-touch support
- Virtualization (only render objects within viewport bounds)
