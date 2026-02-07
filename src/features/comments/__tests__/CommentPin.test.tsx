import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { CommentPin } from '../components/CommentPin'
import type { EditorStore } from '../store'
import type { CommentThread } from '../types'

// Mock the editor store
const mockSelectThread = vi.fn()
let mockSelectedThreadId: string | null = null

vi.mock('../store', () => ({
  useEditorStore: (selector?: (state: EditorStore) => unknown) => {
    if (!selector) return {} as EditorStore
    const mockState: Pick<EditorStore, 'selectedThreadId' | 'selectThread'> = {
      selectedThreadId: mockSelectedThreadId,
      selectThread: mockSelectThread,
    }
    return selector(mockState as EditorStore)
  },
}))

describe('CommentPin', () => {
  const mockThread: CommentThread = {
    id: 'thread-1',
    x: 100,
    y: 200,
    resolved: false,
    createdAt: new Date().toISOString(),
    createdBy: 'User',
    comments: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectedThreadId = null
  })

  it('renders at the correct world position', () => {
    render(<CommentPin thread={mockThread} />)

    const pin = screen.getByTestId('comment-pin')
    expect(pin).toHaveStyle({
      left: '100px',
      top: '200px',
    })
  })

  it('shows comment count for open threads', () => {
    const threadWithComments: CommentThread = {
      ...mockThread,
      comments: [
        { id: 'c1', author: 'User', createdAt: new Date().toISOString(), text: 'Comment 1' },
        { id: 'c2', author: 'User', createdAt: new Date().toISOString(), text: 'Comment 2' },
      ],
    }

    render(<CommentPin thread={threadWithComments} />)

    const pin = screen.getByTestId('comment-pin')
    expect(pin).toHaveTextContent('2')
  })

  it('marks resolved threads with data attribute', () => {
    const resolvedThread: CommentThread = {
      ...mockThread,
      resolved: true,
    }

    render(<CommentPin thread={resolvedThread} />)

    const pin = screen.getByTestId('comment-pin')
    expect(pin).toHaveAttribute('data-resolved', 'true')
  })

  it('marks open threads with data attribute', () => {
    render(<CommentPin thread={mockThread} />)

    const pin = screen.getByTestId('comment-pin')
    expect(pin).toHaveAttribute('data-resolved', 'false')
  })

  it('calls selectThread when clicked', async () => {
    const user = userEvent.setup()
    render(<CommentPin thread={mockThread} />)

    const pin = screen.getByTestId('comment-pin')
    await user.click(pin)

    expect(mockSelectThread).toHaveBeenCalledWith('thread-1')
  })

  it('shows selected state when thread is selected', () => {
    mockSelectedThreadId = 'thread-1'
    render(<CommentPin thread={mockThread} />)

    const pin = screen.getByTestId('comment-pin')
    expect(pin).toHaveAttribute('data-selected', 'true')
  })

  it('shows unselected state when thread is not selected', () => {
    render(<CommentPin thread={mockThread} />)

    const pin = screen.getByTestId('comment-pin')
    expect(pin).toHaveAttribute('data-selected', 'false')
  })
})
