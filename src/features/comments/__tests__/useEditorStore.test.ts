import { act, renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useEditorStore } from '../store'

describe('useEditorStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useEditorStore.setState({
        threads: [],
        selectedThreadId: null,
        filter: 'all',
        focusTarget: null,
      })
    })
    // Mock crypto.randomUUID for deterministic IDs
    let counter = 0
    vi.spyOn(crypto, 'randomUUID').mockImplementation(
      () => `test-uuid-${++counter}` as `${string}-${string}-${string}-${string}-${string}`
    )
  })

  describe('initial state', () => {
    it('starts with empty threads array', () => {
      const { result } = renderHook(() => useEditorStore(state => state.threads))
      expect(result.current).toEqual([])
    })

    it('starts with no selected thread', () => {
      const { result } = renderHook(() => useEditorStore(state => state.selectedThreadId))
      expect(result.current).toBeNull()
    })

    it('starts with filter set to "all"', () => {
      const { result } = renderHook(() => useEditorStore(state => state.filter))
      expect(result.current).toBe('all')
    })
  })

  describe('addThreadAt', () => {
    it('creates a new thread at the specified position', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addThreadAt({ x: 100, y: 200 })
      })

      const threads = useEditorStore.getState().threads
      expect(threads).toHaveLength(1)
      expect(threads[0]).toMatchObject({
        x: 100,
        y: 200,
        resolved: false,
        comments: [],
      })
      expect(threads[0].id).toBeDefined()
      expect(threads[0].createdAt).toBeDefined()
      expect(threads[0].createdBy).toBe('User')
    })

    it('selects the newly created thread', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addThreadAt({ x: 50, y: 75 })
      })

      const selectedId = useEditorStore.getState().selectedThreadId
      const threads = useEditorStore.getState().threads
      expect(selectedId).toBe(threads[0].id)
    })
  })

  describe('selectThread', () => {
    it('sets the selected thread ID', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.selectThread('thread-123')
      })

      expect(useEditorStore.getState().selectedThreadId).toBe('thread-123')
    })

    it('can deselect by passing null', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.selectThread('thread-123')
        result.current.selectThread(null)
      })

      expect(useEditorStore.getState().selectedThreadId).toBeNull()
    })
  })

  describe('setFilter', () => {
    it('updates the filter', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.setFilter('open')
      })

      expect(useEditorStore.getState().filter).toBe('open')

      act(() => {
        result.current.setFilter('resolved')
      })

      expect(useEditorStore.getState().filter).toBe('resolved')
    })
  })

  describe('addComment', () => {
    it('adds a comment to the specified thread', () => {
      const { result } = renderHook(() => useEditorStore())

      // Create a thread first
      act(() => {
        result.current.addThreadAt({ x: 0, y: 0 })
      })

      const threadId = useEditorStore.getState().threads[0].id

      act(() => {
        result.current.addComment(threadId, 'Hello, world!')
      })

      const thread = useEditorStore.getState().threads[0]
      expect(thread.comments).toHaveLength(1)
      expect(thread.comments[0]).toMatchObject({
        text: 'Hello, world!',
        author: 'User',
      })
      expect(thread.comments[0].id).toBeDefined()
      expect(thread.comments[0].createdAt).toBeDefined()
    })
  })

  describe('updateComment', () => {
    it('updates the text of an existing comment', () => {
      const { result } = renderHook(() => useEditorStore())

      // Create thread and add comment
      act(() => {
        result.current.addThreadAt({ x: 0, y: 0 })
      })
      const threadId = useEditorStore.getState().threads[0].id

      act(() => {
        result.current.addComment(threadId, 'Original text')
      })

      const commentId = useEditorStore.getState().threads[0].comments[0].id

      act(() => {
        result.current.updateComment(threadId, commentId, 'Updated text')
      })

      const comment = useEditorStore.getState().threads[0].comments[0]
      expect(comment.text).toBe('Updated text')
    })
  })

  describe('toggleResolved', () => {
    it('toggles the resolved state of a thread', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addThreadAt({ x: 0, y: 0 })
      })

      const threadId = useEditorStore.getState().threads[0].id
      expect(useEditorStore.getState().threads[0].resolved).toBe(false)

      act(() => {
        result.current.toggleResolved(threadId)
      })

      expect(useEditorStore.getState().threads[0].resolved).toBe(true)

      act(() => {
        result.current.toggleResolved(threadId)
      })

      expect(useEditorStore.getState().threads[0].resolved).toBe(false)
    })
  })

  describe('focusOnThread', () => {
    it('sets focusTarget and selectedThreadId', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addThreadAt({ x: 100, y: 200 })
      })

      const threadId = useEditorStore.getState().threads[0].id

      act(() => {
        result.current.focusOnThread(threadId)
      })

      const state = useEditorStore.getState()
      expect(state.selectedThreadId).toBe(threadId)
      expect(state.focusTarget).toEqual({ x: 100, y: 200 })
    })
  })

  describe('clearFocusTarget', () => {
    it('clears the focus target', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addThreadAt({ x: 0, y: 0 })
        const threadId = useEditorStore.getState().threads[0].id
        result.current.focusOnThread(threadId)
      })

      expect(useEditorStore.getState().focusTarget).not.toBeNull()

      act(() => {
        result.current.clearFocusTarget()
      })

      expect(useEditorStore.getState().focusTarget).toBeNull()
    })
  })
})
