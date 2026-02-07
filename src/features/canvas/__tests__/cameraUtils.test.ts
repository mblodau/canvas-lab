import { describe, it, expect } from 'vitest'

import type { Camera } from '../types'
import {
  clamp,
  viewportToWorld,
  worldToViewport,
  getViewportCoordinates,
  squaredDistance,
  getGridStyle,
  MIN_ZOOM,
  MAX_ZOOM,
  GRID_SIZE,
} from '../utils/cameraUtils'

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('returns min when value is below range', () => {
    expect(clamp(-1, 0, 10)).toBe(0)
  })

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0)
  })

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10)
  })

  it('works with negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5)
    expect(clamp(-15, -10, -1)).toBe(-10)
    expect(clamp(0, -10, -1)).toBe(-1)
  })

  it('works with fractional values', () => {
    expect(clamp(0.5, 0.25, 3.0)).toBe(0.5)
    expect(clamp(0.1, 0.25, 3.0)).toBe(0.25)
    expect(clamp(5.0, 0.25, 3.0)).toBe(3.0)
  })
})

describe('viewportToWorld', () => {
  const defaultCamera: Camera = { x: 0, y: 0, zoom: 1 }

  it('returns same coordinates when camera is at origin with zoom 1', () => {
    const result = viewportToWorld(100, 200, defaultCamera)
    expect(result).toEqual({ x: 100, y: 200 })
  })

  it('accounts for camera offset', () => {
    const camera: Camera = { x: 50, y: 100, zoom: 1 }
    const result = viewportToWorld(10, 20, camera)
    expect(result).toEqual({ x: 60, y: 120 })
  })

  it('accounts for zoom level (zoomed in)', () => {
    const camera: Camera = { x: 0, y: 0, zoom: 2 }
    const result = viewportToWorld(100, 200, camera)
    expect(result).toEqual({ x: 50, y: 100 })
  })

  it('accounts for zoom level (zoomed out)', () => {
    const camera: Camera = { x: 0, y: 0, zoom: 0.5 }
    const result = viewportToWorld(100, 200, camera)
    expect(result).toEqual({ x: 200, y: 400 })
  })

  it('combines camera offset and zoom', () => {
    const camera: Camera = { x: 100, y: 200, zoom: 2 }
    const result = viewportToWorld(50, 100, camera)
    expect(result).toEqual({ x: 125, y: 250 })
  })

  it('handles negative camera positions', () => {
    const camera: Camera = { x: -100, y: -200, zoom: 1 }
    const result = viewportToWorld(50, 50, camera)
    expect(result).toEqual({ x: -50, y: -150 })
  })

  it('handles viewport origin (0,0)', () => {
    const camera: Camera = { x: 300, y: 400, zoom: 1.5 }
    const result = viewportToWorld(0, 0, camera)
    expect(result).toEqual({ x: 300, y: 400 })
  })
})

describe('worldToViewport', () => {
  const defaultCamera: Camera = { x: 0, y: 0, zoom: 1 }

  it('returns same coordinates when camera is at origin with zoom 1', () => {
    const result = worldToViewport(100, 200, defaultCamera)
    expect(result).toEqual({ x: 100, y: 200 })
  })

  it('accounts for camera offset', () => {
    const camera: Camera = { x: 50, y: 100, zoom: 1 }
    const result = worldToViewport(60, 120, camera)
    expect(result).toEqual({ x: 10, y: 20 })
  })

  it('accounts for zoom level (zoomed in)', () => {
    const camera: Camera = { x: 0, y: 0, zoom: 2 }
    const result = worldToViewport(50, 100, camera)
    expect(result).toEqual({ x: 100, y: 200 })
  })

  it('is the inverse of viewportToWorld', () => {
    const camera: Camera = { x: 150, y: -80, zoom: 1.7 }
    const viewportX = 300
    const viewportY = 250

    const world = viewportToWorld(viewportX, viewportY, camera)
    const back = worldToViewport(world.x, world.y, camera)

    expect(back.x).toBeCloseTo(viewportX, 10)
    expect(back.y).toBeCloseTo(viewportY, 10)
  })

  it('handles negative world coordinates', () => {
    const camera: Camera = { x: 0, y: 0, zoom: 1 }
    const result = worldToViewport(-100, -200, camera)
    expect(result).toEqual({ x: -100, y: -200 })
  })
})

describe('getViewportCoordinates', () => {
  it('calculates coordinates relative to element top-left', () => {
    const mockElement = {
      getBoundingClientRect: () =>
        ({
          left: 100,
          top: 200,
          width: 800,
          height: 600,
        }) as DOMRect,
    }

    const event = { clientX: 250, clientY: 350 }
    const result = getViewportCoordinates(event, mockElement)

    expect(result).toEqual({ x: 150, y: 150 })
  })

  it('handles element at origin', () => {
    const mockElement = {
      getBoundingClientRect: () =>
        ({
          left: 0,
          top: 0,
          width: 800,
          height: 600,
        }) as DOMRect,
    }

    const event = { clientX: 100, clientY: 200 }
    const result = getViewportCoordinates(event, mockElement)

    expect(result).toEqual({ x: 100, y: 200 })
  })

  it('handles negative offsets (element above/left of viewport)', () => {
    const mockElement = {
      getBoundingClientRect: () =>
        ({
          left: -50,
          top: -100,
          width: 800,
          height: 600,
        }) as DOMRect,
    }

    const event = { clientX: 0, clientY: 0 }
    const result = getViewportCoordinates(event, mockElement)

    expect(result).toEqual({ x: 50, y: 100 })
  })
})

describe('squaredDistance', () => {
  it('calculates squared distance correctly', () => {
    expect(squaredDistance(0, 0, 3, 4)).toBe(25) // 3² + 4² = 9 + 16 = 25
  })

  it('returns 0 for same point', () => {
    expect(squaredDistance(10, 20, 10, 20)).toBe(0)
  })

  it('handles negative coordinates', () => {
    expect(squaredDistance(-5, -5, 5, 5)).toBe(200) // 10² + 10² = 100 + 100 = 200
  })

  it('handles fractional coordinates', () => {
    const result = squaredDistance(0.5, 1.5, 2.5, 3.5)
    expect(result).toBeCloseTo(8, 10) // 2² + 2² = 4 + 4 = 8
  })

  it("is commutative (order doesn't matter)", () => {
    const d1 = squaredDistance(0, 0, 5, 12)
    const d2 = squaredDistance(5, 12, 0, 0)
    expect(d1).toBe(d2)
  })
})

describe('getGridStyle', () => {
  it('generates correct grid style for default camera', () => {
    const camera: Camera = { x: 0, y: 0, zoom: 1 }
    const style = getGridStyle(camera)

    expect(style.backgroundImage).toBe('radial-gradient(circle, #ccc 1px, transparent 1px)')
    expect(style.backgroundSize).toBe(`${GRID_SIZE}px ${GRID_SIZE}px`)
    expect(style.backgroundPosition).toBe('0px 0px')
  })

  it('scales grid size with zoom', () => {
    const camera: Camera = { x: 0, y: 0, zoom: 2 }
    const style = getGridStyle(camera)

    expect(style.backgroundSize).toBe(`${GRID_SIZE * 2}px ${GRID_SIZE * 2}px`)
  })

  it('offsets grid position with camera position', () => {
    const camera: Camera = { x: 100, y: 200, zoom: 1 }
    const style = getGridStyle(camera)

    expect(style.backgroundPosition).toBe('-100px -200px')
  })

  it('combines zoom and camera offset', () => {
    const camera: Camera = { x: 50, y: -100, zoom: 1.5 }
    const style = getGridStyle(camera)

    expect(style.backgroundSize).toBe(`${GRID_SIZE * 1.5}px ${GRID_SIZE * 1.5}px`)
    expect(style.backgroundPosition).toBe('-75px 150px') // -50 * 1.5, -(-100) * 1.5
  })
})

describe('zoom constants', () => {
  it('MIN_ZOOM is less than MAX_ZOOM', () => {
    expect(MIN_ZOOM).toBeLessThan(MAX_ZOOM)
  })

  it('MIN_ZOOM is positive', () => {
    expect(MIN_ZOOM).toBeGreaterThan(0)
  })
})
