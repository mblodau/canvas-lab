import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { ThreadPanel } from '../components/ThreadPanel'
import type { EditorStore } from '../store/useEditorStore'
import type { CommentThread } from '../types'

// Mock formatRelativeTime to avoid time-sensitive assertions
vi.mock('@/shared/utils/formatUtils', () => ({
  formatRelativeTime: () => 'Just now',
}))

// Mock state
let mockThread: CommentThread | undefined
const mockSelectThread = vi.fn()
const mockAddComment = vi.fn()
const mockUpdateComment = vi.fn()
const mockToggleResolved = vi.fn()

vi.mock('../store', () => ({
  useEditorStore: (selector: (state: EditorStore) => unknown) => {
    const mockState: Pick<
      EditorStore,
      'threads' | 'selectThread' | 'addComment' | 'updateComment' | 'toggleResolved'
    > = {
      threads: mockThread ? [mockThread] : [],
      selectThread: mockSelectThread,
      addComment: mockAddComment,
      updateComment: mockUpdateComment,
      toggleResolved: mockToggleResolved,
    }
    return selector(mockState as EditorStore)
  },
}))

const createThread = (overrides: Partial<CommentThread> = {}): CommentThread => ({
  id: 'thread-1',
  x: 100,
  y: 200,
  resolved: false,
  createdAt: '2026-02-07T12:00:00Z',
  createdBy: 'User',
  comments: [
    { id: 'c1', author: 'User', createdAt: '2026-02-07T12:00:00Z', text: 'First comment' },
  ],
  ...overrides,
})

describe('ThreadPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockThread = createThread()
  })

  it('renders thread not found when thread does not exist', () => {
    mockThread = undefined
    render(<ThreadPanel threadId="nonexistent" />)
    expect(screen.getByText('Thread not found')).toBeInTheDocument()
  })

  it('renders thread header with author and time', () => {
    render(<ThreadPanel threadId="thread-1" />)
    expect(screen.getByText('Thread')).toBeInTheDocument()
    // "User" appears in both header and comment list; use getAllByText
    expect(screen.getAllByText('User').length).toBeGreaterThanOrEqual(1)
    // "Just now" appears in both header and comment; use getAllByText
    expect(screen.getAllByText('Just now').length).toBeGreaterThanOrEqual(1)
  })

  it('does not display thread position', () => {
    render(<ThreadPanel threadId="thread-1" />)
    expect(screen.queryByText(/Position/)).not.toBeInTheDocument()
  })

  it('renders comments', () => {
    render(<ThreadPanel threadId="thread-1" />)
    expect(screen.getByText('First comment')).toBeInTheDocument()
  })

  it('calls selectThread(null) when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ThreadPanel threadId="thread-1" />)

    await user.click(screen.getByLabelText('Close'))
    expect(mockSelectThread).toHaveBeenCalledWith(null)
  })

  it('calls addComment when reply is submitted', async () => {
    const user = userEvent.setup()
    render(<ThreadPanel threadId="thread-1" />)

    const textarea = screen.getByPlaceholderText('Add a reply...')
    await user.type(textarea, 'My reply')
    await user.click(screen.getByRole('button', { name: 'Add Reply' }))

    expect(mockAddComment).toHaveBeenCalledWith('thread-1', 'My reply')
  })

  it('disables Add Reply button when textarea is empty', () => {
    render(<ThreadPanel threadId="thread-1" />)

    const addButton = screen.getByRole('button', { name: 'Add Reply' })
    expect(addButton).toBeDisabled()
  })

  it('calls toggleResolved when resolve button is clicked', async () => {
    const user = userEvent.setup()
    render(<ThreadPanel threadId="thread-1" />)

    await user.click(screen.getByRole('button', { name: 'Resolve' }))
    expect(mockToggleResolved).toHaveBeenCalledWith('thread-1')
  })

  it('shows Reopen button for resolved threads', () => {
    mockThread = createThread({ resolved: true })
    render(<ThreadPanel threadId="thread-1" />)
    expect(screen.getByRole('button', { name: 'Reopen' })).toBeInTheDocument()
  })

  it('enters edit mode when Edit is clicked', async () => {
    const user = userEvent.setup()
    render(<ThreadPanel threadId="thread-1" />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    // Should show save/cancel buttons and a textarea with the comment text
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('First comment')).toBeInTheDocument()
  })

  it('calls updateComment when edit is saved', async () => {
    const user = userEvent.setup()
    render(<ThreadPanel threadId="thread-1" />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    const textarea = screen.getByDisplayValue('First comment')
    await user.clear(textarea)
    await user.type(textarea, 'Updated comment')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockUpdateComment).toHaveBeenCalledWith('thread-1', 'c1', 'Updated comment')
  })

  it('exits edit mode when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<ThreadPanel threadId="thread-1" />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    // Edit button should be visible again
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
  })

  it('shows empty state when thread has no comments', () => {
    mockThread = createThread({ comments: [] })
    render(<ThreadPanel threadId="thread-1" />)
    expect(screen.getByText('No comments yet. Add a reply below.')).toBeInTheDocument()
  })
})
