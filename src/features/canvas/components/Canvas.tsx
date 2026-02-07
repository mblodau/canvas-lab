import { CommentPin } from '@/features/comments/components/CommentPin'
import { useEditorStore } from '@/features/comments/store'

import { useCanvasInteraction } from '../hooks/useCanvasInteraction'
import { getGridStyle } from '../utils/cameraUtils'

export const Canvas = () => {
  const { camera, cursor, viewportRef, handlers } = useCanvasInteraction()
  const threads = useEditorStore(state => state.threads)

  return (
    <div
      ref={viewportRef}
      data-testid="canvas-viewport"
      className="relative w-full h-full overflow-hidden select-none"
      style={{ ...getGridStyle(camera), cursor }}
      {...handlers}
    >
      <div
        data-testid="canvas-world"
        className="absolute"
        style={{
          transformOrigin: '0 0',
          transform: `scale(${camera.zoom}) translate(${-camera.x}px, ${-camera.y}px)`,
        }}
      >
        <div
          data-testid="demo-rect"
          className="absolute w-20 h-20 bg-blue-500 border-2 border-blue-700"
          style={{ left: '500px', top: '300px' }}
        />

        <div
          data-testid="demo-rect"
          className="absolute w-20 h-20 bg-green-500 border-2 border-green-700"
          style={{ left: '-200px', top: '-150px' }}
        />

        {threads.map(thread => (
          <CommentPin key={thread.id} thread={thread} />
        ))}
      </div>

      <div
        data-testid="zoom-indicator"
        className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded shadow text-sm font-mono"
      >
        {Math.round(camera.zoom * 100)}%
      </div>
    </div>
  )
}
