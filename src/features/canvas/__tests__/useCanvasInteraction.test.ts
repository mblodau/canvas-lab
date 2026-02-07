import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { EditorStore } from '../../comments/store/useEditorStore'
import { useCanvasInteraction } from '../hooks/useCanvasInteraction'
import { MIN_ZOOM, MAX_ZOOM } from '../utils/cameraUtils'

const { mockAddThreadAt, mockClearFocusTarget, getMockFocusTarget, setMockFocusTarget } =
  vi.hoisted(() => {
    let focusTarget: { x: number; y: number } | null = null
    return {
      mockAddThreadAt: vi.fn(),
      mockClearFocusTarget: vi.fn(),
      getMockFocusTarget: () => focusTarget,
      setMockFocusTarget: (value: { x: number; y: number } | null) => {
        focusTarget = value
      },
    }
  })

vi.mock('@/features/comments/store', () => {
  const getState = (): Pick<EditorStore, 'addThreadAt' | 'clearFocusTarget' | 'focusTarget'> => ({
    addThreadAt: mockAddThreadAt,
    clearFocusTarget: mockClearFocusTarget,
    focusTarget: getMockFocusTarget(),
  })

  const useEditorStore = Object.assign(
    (selector?: (state: EditorStore) => unknown) => {
      if (!selector) return getState()
      const mockState: Pick<EditorStore, 'focusTarget' | 'clearFocusTarget'> = {
        focusTarget: getMockFocusTarget(),
        clearFocusTarget: mockClearFocusTarget,
      }
      return selector(mockState as EditorStore)
    },
    { getState }
  )

  return { useEditorStore }
})

// Helper: create a mock PointerEvent with clientX/clientY relative to element
const createPointerEvent = (
  _type: string,
  options: {
    clientX?: number
    clientY?: number
    button?: number
    pointerId?: number
  } = {}
) => {
  return {
    clientX: options.clientX ?? 0,
    clientY: options.clientY ?? 0,
    button: options.button ?? 0,
    pointerId: options.pointerId ?? 1,
    currentTarget: {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
      setPointerCapture: vi.fn(),
      releasePointerCapture: vi.fn(),
    },
    preventDefault: vi.fn(),
  } as unknown as React.PointerEvent<HTMLDivElement>
}

describe('useCanvasInteraction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockFocusTarget(null)
    // Mock crypto.randomUUID for deterministic tests
    let counter = 0
    vi.spyOn(crypto, 'randomUUID').mockImplementation(
      () => `test-uuid-${++counter}` as `${string}-${string}-${string}-${string}-${string}`
    )
  })

  describe('initial state', () => {
    it('starts with camera at origin and zoom 1', () => {
      const { result } = renderHook(() => useCanvasInteraction())
      expect(result.current.camera).toEqual({ x: 0, y: 0, zoom: 1 })
    })

    it('starts with default cursor', () => {
      const { result } = renderHook(() => useCanvasInteraction())
      expect(result.current.cursor).toBe('default')
    })

    it('provides a viewportRef', () => {
      const { result } = renderHook(() => useCanvasInteraction())
      expect(result.current.viewportRef).toBeDefined()
    })

    it('provides all pointer handlers', () => {
      const { result } = renderHook(() => useCanvasInteraction())
      expect(result.current.handlers.onPointerDown).toBeInstanceOf(Function)
      expect(result.current.handlers.onPointerMove).toBeInstanceOf(Function)
      expect(result.current.handlers.onPointerUp).toBeInstanceOf(Function)
      expect(result.current.handlers.onContextMenu).toBeInstanceOf(Function)
    })
  })

  describe('wheel handler (trackpad pan & zoom)', () => {
    // Note: The wheel handler is attached via useEffect to the DOM element
    // referenced by viewportRef. In renderHook (no real DOM tree), the ref
    // starts as null so the listener isn't attached. Wheel-based camera
    // changes are covered in the Canvas component integration test instead.

    it('camera starts at default when no wheel events have fired', () => {
      const { result } = renderHook(() => useCanvasInteraction())
      expect(result.current.camera).toEqual({ x: 0, y: 0, zoom: 1 })
    })
  })

  describe('pointer pan (space + drag)', () => {
    it('changes cursor to grab when space is pressed', () => {
      const { result } = renderHook(() => useCanvasInteraction())

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))
      })

      expect(result.current.cursor).toBe('grab')
    })

    it('resets cursor when space is released', () => {
      const { result } = renderHook(() => useCanvasInteraction())

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))
      })
      expect(result.current.cursor).toBe('grab')

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }))
      })
      expect(result.current.cursor).toBe('default')
    })

    it('changes cursor to grabbing on pointer down during space press', () => {
      const { result } = renderHook(() => useCanvasInteraction())

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))
      })

      const downEvent = createPointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        button: 0,
      })

      act(() => {
        result.current.handlers.onPointerDown(downEvent)
      })

      expect(result.current.cursor).toBe('grabbing')
    })

    it('pans camera on pointer move during space+drag', () => {
      const { result } = renderHook(() => useCanvasInteraction())

      // Press space
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))
      })

      // Pointer down
      act(() => {
        result.current.handlers.onPointerDown(
          createPointerEvent('pointerdown', {
            clientX: 100,
            clientY: 100,
            button: 0,
          })
        )
      })

      // Pointer move (drag 50px right, 30px down)
      act(() => {
        result.current.handlers.onPointerMove(
          createPointerEvent('pointermove', {
            clientX: 150,
            clientY: 130,
          })
        )
      })

      // Camera should have moved in the opposite direction (panning)
      // dx = 150-100 = 50, dy = 130-100 = 30
      // camera.x = 0 - 50/1 = -50, camera.y = 0 - 30/1 = -30
      expect(result.current.camera.x).toBe(-50)
      expect(result.current.camera.y).toBe(-30)
    })

    it('pans camera on middle mouse drag', () => {
      const { result } = renderHook(() => useCanvasInteraction())

      // Middle mouse button down (button = 1)
      act(() => {
        result.current.handlers.onPointerDown(
          createPointerEvent('pointerdown', {
            clientX: 200,
            clientY: 200,
            button: 1,
          })
        )
      })

      // Drag
      act(() => {
        result.current.handlers.onPointerMove(
          createPointerEvent('pointermove', {
            clientX: 250,
            clientY: 220,
          })
        )
      })

      expect(result.current.camera.x).toBe(-50)
      expect(result.current.camera.y).toBe(-20)
    })

    it('returns cursor to grab after pan ends while space is held', () => {
      const { result } = renderHook(() => useCanvasInteraction())

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))
      })

      act(() => {
        result.current.handlers.onPointerDown(
          createPointerEvent('pointerdown', {
            clientX: 100,
            clientY: 100,
            button: 0,
          })
        )
      })

      act(() => {
        result.current.handlers.onPointerUp(
          createPointerEvent('pointerup', {
            clientX: 150,
            clientY: 130,
          })
        )
      })

      expect(result.current.cursor).toBe('grab')
    })
  })

  describe('click to create thread', () => {
    it('calls addThreadAt on click (no drag)', () => {
      const { result } = renderHook(() => useCanvasInteraction())

      // Pointer down at (100, 200)
      act(() => {
        result.current.handlers.onPointerDown(
          createPointerEvent('pointerdown', {
            clientX: 100,
            clientY: 200,
            button: 0,
          })
        )
      })

      // Pointer up at the same position (click, not drag)
      act(() => {
        result.current.handlers.onPointerUp(
          createPointerEvent('pointerup', {
            clientX: 100,
            clientY: 200,
            button: 0,
          })
        )
      })

      expect(mockAddThreadAt).toHaveBeenCalledTimes(1)
      expect(mockAddThreadAt).toHaveBeenCalledWith({ x: 100, y: 200 })
    })

    it('does not call addThreadAt when drag exceeds threshold', () => {
      const { result } = renderHook(() => useCanvasInteraction())

      act(() => {
        result.current.handlers.onPointerDown(
          createPointerEvent('pointerdown', {
            clientX: 100,
            clientY: 200,
            button: 0,
          })
        )
      })

      // Move 10px (beyond the 3px threshold)
      act(() => {
        result.current.handlers.onPointerUp(
          createPointerEvent('pointerup', {
            clientX: 110,
            clientY: 200,
            button: 0,
          })
        )
      })

      expect(mockAddThreadAt).not.toHaveBeenCalled()
    })

    it('does not call addThreadAt on right click', () => {
      const { result } = renderHook(() => useCanvasInteraction())

      act(() => {
        result.current.handlers.onPointerDown(
          createPointerEvent('pointerdown', {
            clientX: 100,
            clientY: 200,
            button: 2, // right click
          })
        )
      })

      act(() => {
        result.current.handlers.onPointerUp(
          createPointerEvent('pointerup', {
            clientX: 100,
            clientY: 200,
            button: 2,
          })
        )
      })

      expect(mockAddThreadAt).not.toHaveBeenCalled()
    })

    it('calls addThreadAt multiple times on multiple clicks', () => {
      const { result } = renderHook(() => useCanvasInteraction())

      // First click
      act(() => {
        result.current.handlers.onPointerDown(
          createPointerEvent('pointerdown', { clientX: 100, clientY: 100 })
        )
        result.current.handlers.onPointerUp(
          createPointerEvent('pointerup', { clientX: 100, clientY: 100 })
        )
      })

      // Second click
      act(() => {
        result.current.handlers.onPointerDown(
          createPointerEvent('pointerdown', { clientX: 200, clientY: 300 })
        )
        result.current.handlers.onPointerUp(
          createPointerEvent('pointerup', { clientX: 200, clientY: 300 })
        )
      })

      expect(mockAddThreadAt).toHaveBeenCalledTimes(2)
      expect(mockAddThreadAt).toHaveBeenNthCalledWith(1, { x: 100, y: 100 })
      expect(mockAddThreadAt).toHaveBeenNthCalledWith(2, { x: 200, y: 300 })
    })
  })

  describe('context menu', () => {
    it('prevents default on context menu', () => {
      const { result } = renderHook(() => useCanvasInteraction())
      const event = { preventDefault: vi.fn() } as unknown as React.MouseEvent
      result.current.handlers.onContextMenu(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('zoom constraints', () => {
    it('exports valid zoom range constants', () => {
      expect(MIN_ZOOM).toBe(0.25)
      expect(MAX_ZOOM).toBe(3.0)
    })
  })
})
