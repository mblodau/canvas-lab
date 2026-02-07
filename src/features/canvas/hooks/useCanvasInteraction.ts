import { useState, useRef, useEffect, useCallback } from 'react'

import type { Camera, Crosshair } from '../types'
import {
  viewportToWorld,
  clamp,
  MIN_ZOOM,
  MAX_ZOOM,
  DRAG_THRESHOLD,
  ZOOM_SENSITIVITY,
  getViewportCoordinates,
  squaredDistance,
} from '../utils/cameraUtils'

export type CursorStyle = 'default' | 'grab' | 'grabbing'

export interface CanvasInteraction {
  camera: Camera
  crosshairs: Crosshair[]
  cursor: CursorStyle
  viewportRef: React.RefObject<HTMLDivElement | null>
  handlers: {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
    onContextMenu: (e: React.MouseEvent) => void
  }
}

/**
 * Encapsulates all canvas interaction logic: pan, zoom, pointer events,
 * keyboard handling, and cursor state.
 *
 * Trackpad support (cross-platform):
 * - Two-finger scroll → pan (wheel without ctrlKey)
 * - Pinch-to-zoom → zoom at cursor (wheel with ctrlKey)
 * - Space + drag → pan mode
 * - Middle mouse drag → pan mode
 * - Left click (no drag) → place crosshair
 */
export const useCanvasInteraction = (): CanvasInteraction => {
  // Camera state
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 })
  const [crosshairs, setCrosshairs] = useState<Crosshair[]>([])
  const [cursor, setCursor] = useState<CursorStyle>('default')

  // Interaction refs (mutable, not rendered)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const pointerStart = useRef({ x: 0, y: 0 })
  const spacePressed = useRef(false)
  const viewportRef = useRef<HTMLDivElement>(null)

  // We keep a ref to camera for the non-passive wheel handler so it always
  // reads the latest value without needing the effect to re-run.
  const cameraRef = useRef(camera)
  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  // --- Keyboard handling (space bar for pan mode) ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        spacePressed.current = true
        if (!isPanning.current) {
          setCursor('grab')
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressed.current = false
        if (!isPanning.current) {
          setCursor('default')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // --- Wheel handling (non-passive for preventDefault) ---
  // Attached via useEffect so we can set { passive: false }.
  // React's onWheel registers a passive listener and cannot preventDefault.

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      const { x: sx, y: sy } = getViewportCoordinates(e, el)
      const cam = cameraRef.current

      if (e.ctrlKey) {
        // Pinch-to-zoom (trackpad pinch sets ctrlKey on all desktop OSes)
        // Use smooth exponential scaling based on actual delta magnitude
        const before = viewportToWorld(sx, sy, cam)
        const factor = Math.exp(-e.deltaY * ZOOM_SENSITIVITY)
        const newZoom = clamp(cam.zoom * factor, MIN_ZOOM, MAX_ZOOM)

        setCamera({
          x: before.x - sx / newZoom,
          y: before.y - sy / newZoom,
          zoom: newZoom,
        })
      } else {
        // Two-finger scroll → pan
        // deltaX/deltaY are in screen pixels; convert to world units
        setCamera(prev => ({
          ...prev,
          x: prev.x + e.deltaX / prev.zoom,
          y: prev.y + e.deltaY / prev.zoom,
        }))
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  // --- Pointer event handlers ---

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const { x: sx, y: sy } = getViewportCoordinates(e, e.currentTarget)

    pointerStart.current = { x: sx, y: sy }
    panStart.current = { x: sx, y: sy }

    // Middle mouse button or space + left button = pan
    if (e.button === 1 || (e.button === 0 && spacePressed.current)) {
      isPanning.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      setCursor('grabbing')
      e.preventDefault()
    }
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning.current) return

    const { x: sx, y: sy } = getViewportCoordinates(e, e.currentTarget)

    const dx = sx - panStart.current.x
    const dy = sy - panStart.current.y

    // Pan in world space
    setCamera(prev => ({
      ...prev,
      x: prev.x - dx / prev.zoom,
      y: prev.y - dy / prev.zoom,
    }))

    panStart.current = { x: sx, y: sy }
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const { x: sx, y: sy } = getViewportCoordinates(e, e.currentTarget)

    if (isPanning.current) {
      isPanning.current = false
      e.currentTarget.releasePointerCapture(e.pointerId)
      setCursor(spacePressed.current ? 'grab' : 'default')
      return
    }

    // Check if this was a click (not a drag) - compare squared distance to avoid sqrt
    const distanceSquared = squaredDistance(sx, sy, pointerStart.current.x, pointerStart.current.y)

    if (distanceSquared < DRAG_THRESHOLD * DRAG_THRESHOLD && e.button === 0) {
      // Place crosshair at world coordinates
      const cam = cameraRef.current
      const worldPos = viewportToWorld(sx, sy, cam)
      setCrosshairs(prev => [...prev, { id: crypto.randomUUID(), x: worldPos.x, y: worldPos.y }])
    }
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  return {
    camera,
    crosshairs,
    cursor,
    viewportRef,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onContextMenu: handleContextMenu,
    },
  }
}
