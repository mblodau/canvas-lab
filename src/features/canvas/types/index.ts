// Canvas feature types

export interface Camera {
  x: number
  y: number
  zoom: number
}

export interface Crosshair {
  id: string
  x: number
  y: number
}

export interface CanvasItem {
  id: string
  type: string
  position: { x: number; y: number }
  // Add more canvas item properties as needed
}
