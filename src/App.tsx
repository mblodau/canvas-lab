import { Canvas } from '@/features/canvas/components/Canvas'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900">Canvas Lab</h1>
        <p className="text-sm text-gray-600">Miro-like canvas application</p>
      </header>
      <main className="h-[calc(100vh-80px)]">
        <Canvas />
      </main>
    </div>
  )
}

export default App
