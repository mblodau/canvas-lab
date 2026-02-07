import { create } from 'zustand'

import type { Comment, CommentThread } from '../types'

type Filter = 'open' | 'resolved' | 'all'

interface EditorState {
  threads: CommentThread[]
  selectedThreadId: string | null
  filter: Filter
  focusTarget: { x: number; y: number } | null
}

interface EditorActions {
  addThreadAt: (pos: { x: number; y: number }) => void
  selectThread: (id: string | null) => void
  setFilter: (filter: Filter) => void
  addComment: (threadId: string, text: string) => void
  updateComment: (threadId: string, commentId: string, text: string) => void
  toggleResolved: (threadId: string) => void
  focusOnThread: (id: string) => void
  clearFocusTarget: () => void
}

export type EditorStore = EditorState & EditorActions

export const useEditorStore = create<EditorStore>(set => ({
  // Initial state
  threads: [],
  selectedThreadId: null,
  filter: 'all',
  focusTarget: null,

  // Actions
  addThreadAt: (pos: { x: number; y: number }) => {
    const now = new Date().toISOString()
    const newThread: CommentThread = {
      id: crypto.randomUUID(),
      x: pos.x,
      y: pos.y,
      resolved: false,
      createdAt: now,
      createdBy: 'Ingemar Backman',
      comments: [],
    }
    set(state => ({
      threads: [...state.threads, newThread],
      selectedThreadId: newThread.id, // Panel opens immediately
    }))
  },

  selectThread: (id: string | null) => {
    set({ selectedThreadId: id })
  },

  setFilter: (filter: Filter) => {
    set({ filter })
  },

  addComment: (threadId: string, text: string) => {
    const now = new Date().toISOString()
    const newComment: Comment = {
      id: crypto.randomUUID(),
      author: 'Ingemar Backman',
      createdAt: now,
      text,
    }
    set(state => ({
      threads: state.threads.map(thread =>
        thread.id === threadId ? { ...thread, comments: [...thread.comments, newComment] } : thread
      ),
    }))
  },

  updateComment: (threadId: string, commentId: string, text: string) => {
    set(state => ({
      threads: state.threads.map(thread =>
        thread.id === threadId
          ? {
              ...thread,
              comments: thread.comments.map(comment =>
                comment.id === commentId ? { ...comment, text } : comment
              ),
            }
          : thread
      ),
    }))
  },

  toggleResolved: (threadId: string) => {
    set(state => ({
      threads: state.threads.map(thread =>
        thread.id === threadId ? { ...thread, resolved: !thread.resolved } : thread
      ),
    }))
  },

  focusOnThread: (id: string) => {
    set(state => {
      const thread = state.threads.find(t => t.id === id)
      if (!thread) return state
      return {
        selectedThreadId: id,
        focusTarget: { x: thread.x, y: thread.y },
      }
    })
  },

  clearFocusTarget: () => {
    set({ focusTarget: null })
  },
}))
