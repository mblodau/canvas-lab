import { useCanvasStore } from '../store'

export const useCanvas = () => {
  const store = useCanvasStore()

  return {
    items: store.items,
    selectedItemId: store.selectedItemId,
    setSelectedItem: store.setSelectedItem,
    addItem: store.addItem,
  }
}
