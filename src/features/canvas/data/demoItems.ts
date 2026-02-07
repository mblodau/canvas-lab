import type { CSSProperties } from 'react'

interface DemoItem {
  id: string
  className: string
  style: CSSProperties
}

export const DEMO_ITEMS: DemoItem[] = [
  {
    id: 'blue-rect',
    className: 'w-24 h-24 bg-blue-500 border-2 border-blue-700',
    style: { left: 500, top: 300 },
  },
  {
    id: 'red-circle',
    className: 'w-20 h-20 bg-red-500 border-2 border-red-700 rounded-full',
    style: { left: -200, top: -150 },
  },
  {
    id: 'purple-diamond',
    className: 'w-24 h-24 bg-purple-500 border-2 border-purple-700',
    style: { left: 800, top: -100, transform: 'rotate(45deg)' },
  },
  {
    id: 'orange-triangle',
    className: 'w-0 h-0',
    style: {
      left: -400,
      top: 200,
      borderLeft: '20px solid transparent',
      borderRight: '20px solid transparent',
      borderBottom: '35px solid #f97316',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
    },
  },
  {
    id: 'teal-rounded-rect',
    className: 'w-32 h-16 bg-teal-500 border-2 border-teal-700 rounded-lg',
    style: { left: 200, top: 600 },
  },
]
