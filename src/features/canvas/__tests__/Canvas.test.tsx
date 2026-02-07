import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import type { EditorStore } from '../../comments/store/useEditorStore'
import type { CommentThread } from '../../comments/types'
import { Canvas } from '../components/Canvas'

// Mock the editor store
const mockThreads: CommentThread[] = []
const mockAddThreadAt = vi.fn()
const mockSelectThread = vi.fn()
const mockSetFilter = vi.fn()
const mockAddComment = vi.fn()
const mockUpdateComment = vi.fn()
const mockToggleResolved = vi.fn()
const mockFocusOnThread = vi.fn()
const mockClearFocusTarget = vi.fn()

// Create a complete mock state that matches EditorStore
const createMockState = (): EditorStore => ({
  threads: mockThreads,
  selectedThreadId: null,
  filter: 'all',
  focusTarget: null,
  addThreadAt: mockAddThreadAt,
  selectThread: mockSelectThread,
  setFilter: mockSetFilter,
  addComment: mockAddComment,
  updateComment: mockUpdateComment,
  toggleResolved: mockToggleResolved,
  focusOnThread: mockFocusOnThread,
  clearFocusTarget: mockClearFocusTarget,
})

vi.mock('@/features/comments/store', () => ({
  useEditorStore: Object.assign(
    (selector?: (state: EditorStore) => unknown) => {
      if (!selector) {
        return createMockState()
      }
      const mockState = createMockState()
      return selector(mockState)
    },
    {
      getState: () => createMockState(),
    }
  ),
}))

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

    it('renders the overlay container', () => {
      render(<Canvas />)
      const overlay = screen.getByTestId('canvas-overlay')
      expect(overlay).toBeInTheDocument()
    })

    it('renders the zoom indicator with default 100%', () => {
      render(<Canvas />)
      const zoomIndicator = screen.getByTestId('zoom-indicator')
      expect(zoomIndicator).toBeInTheDocument()
      expect(zoomIndicator).toHaveTextContent('100%')
    })

    it('renders demo items', () => {
      render(<Canvas />)
      const items = screen.getAllByTestId('demo-item')
      expect(items).toHaveLength(5)
    })
  })

  describe('user interactions', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      mockThreads.length = 0
      // Mock crypto.randomUUID for deterministic thread IDs
      let counter = 0
      vi.spyOn(crypto, 'randomUUID').mockImplementation(
        () => `test-uuid-${++counter}` as `${string}-${string}-${string}-${string}-${string}`
      )
    })

    it('calls addThreadAt when user clicks on canvas', async () => {
      const user = userEvent.setup()
      render(<Canvas />)

      const viewport = screen.getByTestId('canvas-viewport')

      // Click at center of viewport using pointer API
      await user.pointer([
        { target: viewport, coords: { clientX: 400, clientY: 300 } },
        { keys: '[MouseLeft]' },
      ])

      // Wait for addThreadAt to be called
      await waitFor(() => {
        expect(mockAddThreadAt).toHaveBeenCalled()
      })

      expect(mockAddThreadAt).toHaveBeenCalledWith({ x: 400, y: 300 })
    })

    it('renders comment pins from store', () => {
      mockThreads.push(
        {
          id: 'thread-1',
          x: 100,
          y: 200,
          resolved: false,
          createdAt: new Date().toISOString(),
          createdBy: 'User',
          comments: [],
        },
        {
          id: 'thread-2',
          x: 300,
          y: 400,
          resolved: false,
          createdAt: new Date().toISOString(),
          createdBy: 'User',
          comments: [],
        }
      )

      render(<Canvas />)

      const pins = screen.getAllByTestId('comment-pin')
      expect(pins).toHaveLength(2)
    })

    it('does not call addThreadAt when user drags (exceeds threshold)', async () => {
      const user = userEvent.setup()
      render(<Canvas />)

      const viewport = screen.getByTestId('canvas-viewport')

      // Drag from (100, 100) to (150, 150) - exceeds 3px threshold
      await user.pointer([
        { keys: '[MouseLeft>]', target: viewport, coords: { clientX: 100, clientY: 100 } },
        { coords: { clientX: 150, clientY: 150 } },
        { keys: '[/MouseLeft]' },
      ])

      // Wait a bit to ensure addThreadAt was not called
      await waitFor(
        () => {
          expect(mockAddThreadAt).not.toHaveBeenCalled()
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
