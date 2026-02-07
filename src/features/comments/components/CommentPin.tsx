import { useState, useRef, useLayoutEffect } from 'react'

import { formatRelativeTime } from '@/shared/utils/formatUtils'

import { useEditorStore } from '../store'
import type { CommentThread } from '../types'

const PIN_SIZE = 32
const EXPANDED_WIDTH = 256
const ANIMATION_DURATION = '0.2s'

interface CommentPinProps {
  thread: CommentThread
  camera: { x: number; y: number; zoom: number }
}

export const CommentPin = ({ thread, camera }: CommentPinProps) => {
  const selectedThreadId = useEditorStore(state => state.selectedThreadId)
  const selectThread = useEditorStore(state => state.selectThread)
  const [hovered, setHovered] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [expandedHeight, setExpandedHeight] = useState(PIN_SIZE)

  const isSelected = selectedThreadId === thread.id
  const commentCount = thread.comments.length
  const firstComment = thread.comments[0]

  const viewportX = (thread.x - camera.x) * camera.zoom
  const viewportY = (thread.y - camera.y) * camera.zoom

  // Measure the full content height whenever it could change.
  // Content is always rendered (at full width) but clipped by overflow:hidden.
  useLayoutEffect(() => {
    if (contentRef.current) {
      setExpandedHeight(contentRef.current.scrollHeight)
    }
  }, [thread.comments, thread.createdBy, thread.resolved])

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation()
    selectThread(thread.id)
  }

  const bgColor = thread.resolved ? 'bg-green-500' : 'bg-blue-500'
  const ringColor = thread.resolved ? 'ring-green-300' : 'ring-blue-300'
  const author = firstComment ? firstComment.author : thread.createdBy
  const initial = author.charAt(0).toUpperCase()

  const avatar = (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/30 text-xs font-bold text-white">
      {initial}
    </div>
  )

  return (
    <div
      data-testid="comment-pin"
      data-resolved={thread.resolved}
      data-selected={isSelected}
      className="absolute cursor-pointer pointer-events-auto"
      style={{
        left: `${viewportX}px`,
        top: `${viewportY}px`,
        // Anchor at bottom-left corner (where the pointer is)
        transform: 'translate(0, -100%)',
        zIndex: hovered ? 9999 : isSelected ? 10 : 1,
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`${bgColor} shadow-lg ${
          isSelected ? 'ring-4 ring-yellow-400' : `ring-2 ${ringColor}`
        }`}
        style={{
          width: hovered ? `${EXPANDED_WIDTH}px` : `${PIN_SIZE}px`,
          height: hovered ? `${expandedHeight}px` : `${PIN_SIZE}px`,
          borderRadius: '8px 8px 8px 2px',
          transition: `width ${ANIMATION_DURATION} ease-out, height ${ANIMATION_DURATION} ease-out`,
          overflow: 'hidden',
        }}
      >
        <div ref={contentRef} style={{ width: `${EXPANDED_WIDTH}px` }}>
          <div className="flex items-center justify-between border-b border-white/20 pr-3">
            <div className="flex items-center gap-2">
              <div
                className="flex shrink-0 items-center justify-center"
                style={{ width: `${PIN_SIZE}px`, height: `${PIN_SIZE}px` }}
              >
                {avatar}
              </div>
              <span className="text-sm font-semibold text-white">{author}</span>
            </div>
            <span className="text-xs text-white/80">
              {formatRelativeTime(firstComment ? firstComment.createdAt : thread.createdAt)}
            </span>
          </div>
          <div className="px-3 py-2">
            {firstComment ? (
              <p className="text-sm text-white line-clamp-3">{firstComment.text}</p>
            ) : (
              <p className="text-sm text-white/80 italic">New thread</p>
            )}
          </div>
          <div className="border-t border-white/20 px-3 py-2">
            <span className="text-xs text-white/80">
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
