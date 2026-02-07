import { useEditorStore } from '../store'

import { ThreadList } from './ThreadList'
import { ThreadPanel } from './ThreadPanel'

export const SidePanel = () => {
  const selectedThreadId = useEditorStore(state => state.selectedThreadId)

  return (
    <div className="h-full w-80 border-l border-gray-200 bg-white">
      {selectedThreadId ? <ThreadPanel threadId={selectedThreadId} /> : <ThreadList />}
    </div>
  )
}
