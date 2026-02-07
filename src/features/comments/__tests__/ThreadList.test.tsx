import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { ThreadList } from '../components/ThreadList'
import type { EditorStore } from '../store/useEditorStore'
import type { CommentThread } from '../types'

// Mock formatRelativeTime to avoid time-sensitive assertions
vi.mock('@/shared/utils/formatUtils', () => ({
  formatRelativeTime: (dateString: string) => `mocked-${dateString}`,
}))

// Mock state
let mockThreads: CommentThread[] = []
let mockFilter: EditorStore['filter'] = 'all'
const mockSetFilter = vi.fn()
const mockFocusOnThread = vi.fn()

vi.mock('../store', () => ({
  useEditorStore: (selector: (state: EditorStore) => unknown) => {
    const mockState: Pick<EditorStore, 'threads' | 'filter' | 'setFilter' | 'focusOnThread'> = {
      threads: mockThreads,
      filter: mockFilter,
      setFilter: mockSetFilter,
      focusOnThread: mockFocusOnThread,
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
  comments: [],
  ...overrides,
})

describe('ThreadList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockThreads = []
    mockFilter = 'all'
  })

  it('shows empty state when no threads exist', () => {
    render(<ThreadList />)
    expect(
      screen.getByText('No threads yet. Click on the canvas to create one.')
    ).toBeInTheDocument()
  })

  it('renders threads with first comment text', () => {
    mockThreads = [
      createThread({
        comments: [
          { id: 'c1', author: 'User', createdAt: '2026-02-07T12:00:00Z', text: 'Hello world' },
        ],
      }),
    ]

    render(<ThreadList />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('shows "New thread" for threads without comments', () => {
    mockThreads = [createThread()]

    render(<ThreadList />)
    expect(screen.getByText('New thread')).toBeInTheDocument()
  })

  it('shows comment count', () => {
    mockThreads = [
      createThread({
        comments: [
          { id: 'c1', author: 'User', createdAt: '2026-02-07T12:00:00Z', text: 'First' },
          { id: 'c2', author: 'User', createdAt: '2026-02-07T12:01:00Z', text: 'Second' },
        ],
      }),
    ]

    render(<ThreadList />)
    expect(screen.getByText('2 comments')).toBeInTheDocument()
  })

  it('shows Open badge for unresolved threads', () => {
    mockThreads = [createThread()]

    render(<ThreadList />)
    const badge = screen.getByTestId('thread-status-badge')
    expect(badge).toHaveTextContent('Open')
  })

  it('shows Resolved badge for resolved threads', () => {
    mockThreads = [createThread({ resolved: true })]

    render(<ThreadList />)
    const badge = screen.getByTestId('thread-status-badge')
    expect(badge).toHaveTextContent('Resolved')
  })

  it('calls focusOnThread when a thread item is clicked', async () => {
    const user = userEvent.setup()
    mockThreads = [createThread({ id: 'thread-abc' })]

    render(<ThreadList />)

    const threadItem = screen.getByTestId('thread-item')
    await user.click(threadItem)

    expect(mockFocusOnThread).toHaveBeenCalledWith('thread-abc')
  })

  it('calls setFilter when filter tabs are clicked', async () => {
    const user = userEvent.setup()
    render(<ThreadList />)

    await user.click(screen.getByRole('button', { name: /^Open/ }))
    expect(mockSetFilter).toHaveBeenCalledWith('open')

    await user.click(screen.getByRole('button', { name: /^Resolved/ }))
    expect(mockSetFilter).toHaveBeenCalledWith('resolved')

    await user.click(screen.getByRole('button', { name: /^All/ }))
    expect(mockSetFilter).toHaveBeenCalledWith('all')
  })

  it('filters threads by resolved status', () => {
    mockFilter = 'resolved'
    mockThreads = [
      createThread({ id: 't1', resolved: false }),
      createThread({ id: 't2', resolved: true }),
    ]

    render(<ThreadList />)

    // Only the resolved thread should appear in the list
    const threadItems = screen.getAllByTestId('thread-item')
    expect(threadItems).toHaveLength(1)
  })

  it('shows empty state for filters with no matching threads', () => {
    mockFilter = 'resolved'
    mockThreads = [createThread({ resolved: false })]

    render(<ThreadList />)
    expect(screen.getByText('No resolved threads.')).toBeInTheDocument()
  })
})
