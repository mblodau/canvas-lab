import type React from 'react'

import type { Camera } from '../types'

// --- Constants ---

export const GRID_SIZE = 20 // pixels in world units
export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 3.0
export const DRAG_THRESHOLD = 3 // pixels to distinguish click from drag
export const ZOOM_SENSITIVITY = 0.005 // for smooth trackpad zoom

// --- Pure functions ---

/** Clamp a value between min and max (inclusive). */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Convert viewport (screen-relative) coordinates to world coordinates.
 * Viewport (0,0) is the top-left corner of the canvas element.
 */
export const viewportToWorld = (
  viewportX: number,
  viewportY: number,
  camera: Camera
): { x: number; y: number } => {
  return {
    x: camera.x + viewportX / camera.zoom,
    y: camera.y + viewportY / camera.zoom,
  }
}

/**
 * Convert world coordinates to viewport (screen-relative) coordinates.
 * Useful for positioning UI overlays at world positions.
 */
export const worldToViewport = (
  worldX: number,
  worldY: number,
  camera: Camera
): { x: number; y: number } => {
  return {
    x: (worldX - camera.x) * camera.zoom,
    y: (worldY - camera.y) * camera.zoom,
  }
}

/**
 * Extract viewport coordinates from a pointer/mouse event relative to the element.
 * Returns coordinates relative to the element's top-left corner.
 */
export const getViewportCoordinates = (
  event: { clientX: number; clientY: number },
  element: { getBoundingClientRect(): DOMRect }
): { x: number; y: number } => {
  const rect = element.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

/**
 * Calculate squared distance between two points (avoids Math.sqrt for performance).
 */
export const squaredDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x2 - x1
  const dy = y2 - y1
  return dx * dx + dy * dy
}

/**
 * Generate grid background style for the canvas viewport.
 */
export const getGridStyle = (camera: Camera): React.CSSProperties => {
  return {
    backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)',
    backgroundSize: `${GRID_SIZE * camera.zoom}px ${GRID_SIZE * camera.zoom}px`,
    backgroundPosition: `${-camera.x * camera.zoom}px ${-camera.y * camera.zoom}px`,
  }
}
