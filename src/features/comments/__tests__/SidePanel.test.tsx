import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { SidePanel } from '../components/SidePanel'
import type { EditorStore } from '../store/useEditorStore'

// Mock child components to isolate SidePanel logic
vi.mock('../components/ThreadList', () => ({
  ThreadList: () => <div data-testid="thread-list">ThreadList</div>,
}))

vi.mock('../components/ThreadPanel', () => ({
  ThreadPanel: ({ threadId }: { threadId: string }) => (
    <div data-testid="thread-panel">ThreadPanel: {threadId}</div>
  ),
}))

let mockSelectedThreadId: string | null = null

vi.mock('../store', () => ({
  useEditorStore: (selector: (state: EditorStore) => unknown) => {
    const mockState: Pick<EditorStore, 'selectedThreadId'> = {
      selectedThreadId: mockSelectedThreadId,
    }
    return selector(mockState as EditorStore)
  },
}))

describe('SidePanel', () => {
  beforeEach(() => {
    mockSelectedThreadId = null
  })

  it('renders ThreadList when no thread is selected', () => {
    render(<SidePanel />)
    expect(screen.getByTestId('thread-list')).toBeInTheDocument()
    expect(screen.queryByTestId('thread-panel')).not.toBeInTheDocument()
  })

  it('renders ThreadPanel when a thread is selected', () => {
    mockSelectedThreadId = 'thread-123'
    render(<SidePanel />)
    expect(screen.getByTestId('thread-panel')).toBeInTheDocument()
    expect(screen.getByText('ThreadPanel: thread-123')).toBeInTheDocument()
    expect(screen.queryByTestId('thread-list')).not.toBeInTheDocument()
  })
})
