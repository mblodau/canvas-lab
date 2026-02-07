import { Canvas } from '@/features/canvas/components/Canvas'
import { SidePanel } from '@/features/comments/components'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900">Canvas Lab</h1>
      </header>
      <main className="flex h-[calc(100vh-80px)]">
        <div className="flex-1">
          <Canvas />
        </div>
        <SidePanel />
      </main>
    </div>
  )
}

export default App
