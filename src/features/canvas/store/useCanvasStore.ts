import { create } from 'zustand'

interface CanvasState {
  // Add your canvas state here
  items: unknown[]
  selectedItemId: string | null
}

interface CanvasActions {
  // Add your canvas actions here
  setSelectedItem: (id: string | null) => void
  addItem: (item: unknown) => void
}

type CanvasStore = CanvasState & CanvasActions

export const useCanvasStore = create<CanvasStore>(set => ({
  // Initial state
  items: [],
  selectedItemId: null,

  // Actions
  setSelectedItem: id => set({ selectedItemId: id }),
  addItem: item => set(state => ({ items: [...state.items, item] })),
}))
