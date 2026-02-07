import { useState } from 'react'

import { formatRelativeTime } from '@/shared/utils/formatUtils'

import { useEditorStore } from '../store'
import type { Comment } from '../types'

interface ThreadPanelProps {
  threadId: string
}

export const ThreadPanel = ({ threadId }: ThreadPanelProps) => {
  const thread = useEditorStore(state => state.threads.find(t => t.id === threadId))
  const selectThread = useEditorStore(state => state.selectThread)
  const addComment = useEditorStore(state => state.addComment)
  const updateComment = useEditorStore(state => state.updateComment)
  const toggleResolved = useEditorStore(state => state.toggleResolved)

  const [replyText, setReplyText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  if (!thread) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Thread not found</p>
      </div>
    )
  }

  const handleAddReply = () => {
    if (replyText.trim()) {
      addComment(threadId, replyText.trim())
      setReplyText('')
    }
  }

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditingText(comment.text)
  }

  const handleSaveEdit = () => {
    if (editingCommentId && editingText.trim()) {
      updateComment(threadId, editingCommentId, editingText.trim())
      setEditingCommentId(null)
      setEditingText('')
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingText('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Thread</h2>
          <button
            onClick={() => selectThread(null)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="text-sm text-gray-600">
          <span>{formatRelativeTime(thread.createdAt)}</span>
          <span className="text-gray-400"> • </span>
          <span>{thread.createdBy}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {thread.comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Add a reply below.</p>
        ) : (
          <div className="space-y-4">
            {thread.comments.map(comment => (
              <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  {editingCommentId !== comment.id && (
                    <button
                      onClick={() => handleStartEdit(comment)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingCommentId === comment.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4">
        <textarea
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          placeholder="Add a reply..."
          className="mb-2 w-full rounded border border-gray-300 p-2 text-sm"
          rows={3}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleAddReply()
            }
          }}
        />
        <div className="flex items-center justify-between">
          <button
            onClick={handleAddReply}
            disabled={!replyText.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Reply
          </button>
          <button
            onClick={() => toggleResolved(threadId)}
            className={`rounded px-4 py-2 text-sm ${
              thread.resolved
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {thread.resolved ? 'Reopen' : 'Resolve'}
          </button>
        </div>
      </div>
    </div>
  )
}
