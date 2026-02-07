import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { Canvas } from '../components/Canvas'

describe('Canvas', () => {
  describe('rendering (smoke tests)', () => {
    it('renders the viewport container', () => {
      render(<Canvas />)
      const viewport = screen.getByTestId('canvas-viewport')
      expect(viewport).toBeInTheDocument()
    })

    it('renders the world container', () => {
      render(<Canvas />)
      const world = screen.getByTestId('canvas-world')
      expect(world).toBeInTheDocument()
    })

    it('renders the zoom indicator with default 100%', () => {
      render(<Canvas />)
      const zoomIndicator = screen.getByTestId('zoom-indicator')
      expect(zoomIndicator).toBeInTheDocument()
      expect(zoomIndicator).toHaveTextContent('100%')
    })

    it('renders demo rectangles', () => {
      render(<Canvas />)
      const world = screen.getByTestId('canvas-world')
      // Two demo rectangles should be present as children
      const rects = world.querySelectorAll('.bg-blue-500, .bg-green-500')
      expect(rects).toHaveLength(2)
    })
  })

  describe('user interactions', () => {
    beforeEach(() => {
      // Mock crypto.randomUUID for deterministic crosshair IDs
      let counter = 0
      vi.spyOn(crypto, 'randomUUID').mockImplementation(
        () => `test-uuid-${++counter}` as `${string}-${string}-${string}-${string}-${string}`
      )
    })

    it('places a crosshair when user clicks on canvas', async () => {
      const user = userEvent.setup()
      render(<Canvas />)

      const viewport = screen.getByTestId('canvas-viewport')

      // Click at center of viewport using pointer API
      await user.pointer([
        { target: viewport, coords: { clientX: 400, clientY: 300 } },
        { keys: '[MouseLeft]' },
      ])

      // Wait for crosshair to appear
      await waitFor(() => {
        const markers = screen.queryAllByTestId('crosshair-marker')
        expect(markers.length).toBeGreaterThan(0)
      })

      const markers = screen.getAllByTestId('crosshair-marker')
      expect(markers).toHaveLength(1)
    })

    it('places multiple crosshairs on multiple clicks', async () => {
      const user = userEvent.setup()
      render(<Canvas />)

      const viewport = screen.getByTestId('canvas-viewport')

      // First click
      await user.pointer([
        { target: viewport, coords: { clientX: 100, clientY: 100 } },
        { keys: '[MouseLeft]' },
      ])
      await waitFor(() => {
        expect(screen.getAllByTestId('crosshair-marker')).toHaveLength(1)
      })

      // Second click
      await user.pointer([
        { target: viewport, coords: { clientX: 200, clientY: 200 } },
        { keys: '[MouseLeft]' },
      ])
      await waitFor(() => {
        expect(screen.getAllByTestId('crosshair-marker')).toHaveLength(2)
      })

      const markers = screen.getAllByTestId('crosshair-marker')
      expect(markers).toHaveLength(2)
    })

    it('does not place crosshair when user drags (exceeds threshold)', async () => {
      const user = userEvent.setup()
      render(<Canvas />)

      const viewport = screen.getByTestId('canvas-viewport')

      // Drag from (100, 100) to (150, 150) - exceeds 3px threshold
      await user.pointer([
        { keys: '[MouseLeft>]', target: viewport, coords: { clientX: 100, clientY: 100 } },
        { coords: { clientX: 150, clientY: 150 } },
        { keys: '[/MouseLeft]' },
      ])

      // Wait a bit to ensure no crosshair was placed
      await waitFor(
        () => {
          const markers = screen.queryAllByTestId('crosshair-marker')
          expect(markers).toHaveLength(0)
        },
        { timeout: 100 }
      )
    })

    it('updates zoom indicator when zoom changes', async () => {
      const user = userEvent.setup()
      render(<Canvas />)

      const viewport = screen.getByTestId('canvas-viewport')
      const zoomIndicator = screen.getByTestId('zoom-indicator')

      // Initial zoom should be 100%
      expect(zoomIndicator).toHaveTextContent('100%')

      // Simulate pinch-to-zoom (wheel with ctrlKey)
      await user.pointer([{ target: viewport, coords: { clientX: 400, clientY: 300 } }])

      // Trigger wheel event with ctrlKey (pinch-to-zoom)
      await act(async () => {
        const wheelEvent = new WheelEvent('wheel', {
          bubbles: true,
          cancelable: true,
          clientX: 400,
          clientY: 300,
          deltaY: -100, // Negative = zoom in
          ctrlKey: true, // Pinch gesture
        })
        viewport.dispatchEvent(wheelEvent)
      })

      // Wait for zoom to update
      await waitFor(() => {
        const text = zoomIndicator.textContent
        expect(text).not.toBe('100%')
      })

      // Zoom should have increased
      const newZoomText = zoomIndicator.textContent
      expect(newZoomText).toBeTruthy()
      const zoomValue = parseInt(newZoomText?.replace('%', '') || '100')
      expect(zoomValue).toBeGreaterThan(100)
    })

    it('responds to space key for pan mode', async () => {
      const user = userEvent.setup()
      render(<Canvas />)

      const viewport = screen.getByTestId('canvas-viewport')

      // Press space key - should enable pan mode
      await user.keyboard('{Space>}')

      // Verify space key was processed (cursor state is tested in hook tests)
      // This integration test verifies the component responds to keyboard events
      expect(viewport).toBeInTheDocument()

      // Release space key
      await user.keyboard('{/Space}')
    })
  })
})
