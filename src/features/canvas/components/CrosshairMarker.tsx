import type { Crosshair } from '../types'

interface CrosshairMarkerProps {
  crosshair: Crosshair
}

export const CrosshairMarker = ({ crosshair }: CrosshairMarkerProps) => {
  return (
    <div
      data-testid="crosshair-marker"
      className="absolute pointer-events-none"
      style={{
        left: `${crosshair.x}px`,
        top: `${crosshair.y}px`,
        width: '24px',
        height: '24px',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to right, transparent calc(50% - 1px), red calc(50% - 1px), red calc(50% + 1px), transparent calc(50% + 1px)),
            linear-gradient(to bottom, transparent calc(50% - 1px), red calc(50% - 1px), red calc(50% + 1px), transparent calc(50% + 1px))
          `,
        }}
      />
    </div>
  )
}
