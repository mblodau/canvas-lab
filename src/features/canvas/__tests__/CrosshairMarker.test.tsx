import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, it, expect } from 'vitest'

import { CrosshairMarker } from '../components/CrosshairMarker'
import type { Crosshair } from '../types'

describe('CrosshairMarker', () => {
  const mockCrosshair: Crosshair = {
    id: 'test-1',
    x: 100,
    y: 200,
  }

  it('renders at correct world coordinates', () => {
    render(<CrosshairMarker crosshair={mockCrosshair} />)
    const marker = screen.getByTestId('crosshair-marker')
    expect(marker).toBeInTheDocument()
    // Test that marker is positioned correctly (user-facing behavior)
    expect(marker).toHaveStyle({
      left: '100px',
      top: '200px',
    })
  })

  it('is visible to users', () => {
    render(<CrosshairMarker crosshair={mockCrosshair} />)
    const marker = screen.getByTestId('crosshair-marker')
    // Test that marker is visible (user-facing behavior)
    expect(marker).toBeVisible()
  })

  it('does not block pointer events', () => {
    render(<CrosshairMarker crosshair={mockCrosshair} />)
    const marker = screen.getByTestId('crosshair-marker')
    // Test that marker doesn't interfere with interactions (user-facing behavior)
    // pointer-events-none means clicks pass through
    expect(marker).toHaveClass('pointer-events-none')
  })

  it('renders at different world positions', () => {
    const crosshair1: Crosshair = { id: 'test-1', x: 50, y: 75 }
    const crosshair2: Crosshair = { id: 'test-2', x: 300, y: 400 }

    const { rerender } = render(<CrosshairMarker crosshair={crosshair1} />)
    let marker = screen.getByTestId('crosshair-marker')
    expect(marker).toHaveStyle({ left: '50px', top: '75px' })

    rerender(<CrosshairMarker crosshair={crosshair2} />)
    marker = screen.getByTestId('crosshair-marker')
    expect(marker).toHaveStyle({ left: '300px', top: '400px' })
  })

  it('renders multiple markers independently', () => {
    const crosshair1: Crosshair = { id: 'test-1', x: 100, y: 100 }
    const crosshair2: Crosshair = { id: 'test-2', x: 200, y: 200 }

    render(
      <>
        <CrosshairMarker crosshair={crosshair1} />
        <CrosshairMarker crosshair={crosshair2} />
      </>
    )

    const markers = screen.getAllByTestId('crosshair-marker')
    expect(markers).toHaveLength(2)
    expect(markers[0]).toHaveStyle({ left: '100px', top: '100px' })
    expect(markers[1]).toHaveStyle({ left: '200px', top: '200px' })
  })
})
