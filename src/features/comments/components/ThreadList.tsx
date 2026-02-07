import { formatRelativeTime } from '@/shared/utils/formatUtils'

import { useEditorStore } from '../store'

export const ThreadList = () => {
  const threads = useEditorStore(state => state.threads)
  const filter = useEditorStore(state => state.filter)
  const setFilter = useEditorStore(state => state.setFilter)
  const focusOnThread = useEditorStore(state => state.focusOnThread)

  const filteredThreads = threads.filter(thread => {
    if (filter === 'open') return !thread.resolved
    if (filter === 'resolved') return thread.resolved
    return true // 'all'
  })

  const openCount = threads.filter(t => !t.resolved).length
  const resolvedCount = threads.filter(t => t.resolved).length
  const allCount = threads.length

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            All
            {allCount > 0 && (
              <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs">{allCount}</span>
            )}
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              filter === 'open'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Open
            {openCount > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs">{openCount}</span>
            )}
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              filter === 'resolved'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Resolved
            {resolvedCount > 0 && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs">
                {resolvedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {filter === 'all' && 'No threads yet. Click on the canvas to create one.'}
            {filter === 'open' && 'No open threads.'}
            {filter === 'resolved' && 'No resolved threads.'}
          </div>
        ) : (
          <div data-testid="thread-items" className="divide-y divide-gray-100">
            {filteredThreads.map(thread => {
              const firstComment = thread.comments[0]
              return (
                <button
                  key={thread.id}
                  data-testid="thread-item"
                  onClick={() => focusOnThread(thread.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {thread.resolved ? (
                          <span
                            data-testid="thread-status-badge"
                            className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                          >
                            Resolved
                          </span>
                        ) : (
                          <span
                            data-testid="thread-status-badge"
                            className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                          >
                            Open
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(thread.createdAt)}
                        </span>
                      </div>
                      {firstComment ? (
                        <p className="text-sm text-gray-700 line-clamp-2">{firstComment.text}</p>
                      ) : (
                        <p className="text-sm text-gray-500 italic">New thread</p>
                      )}
                      <div className="mt-1 text-xs text-gray-500">
                        {thread.comments.length}{' '}
                        {thread.comments.length === 1 ? 'comment' : 'comments'}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
