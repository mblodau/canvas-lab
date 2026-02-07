import { describe, it, expect, vi, afterEach } from 'vitest'

import { formatRelativeTime } from '../utils/formatUtils'

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Just now" for less than a minute ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-07T12:00:30Z'))
    expect(formatRelativeTime('2026-02-07T12:00:00Z')).toBe('Just now')
  })

  it('returns "1 minute ago" for exactly 1 minute ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-07T12:01:00Z'))
    expect(formatRelativeTime('2026-02-07T12:00:00Z')).toBe('1 minute ago')
  })

  it('returns "X minutes ago" for less than an hour', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-07T12:45:00Z'))
    expect(formatRelativeTime('2026-02-07T12:00:00Z')).toBe('45 minutes ago')
  })

  it('returns "1 hour ago" for exactly 1 hour', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-07T13:00:00Z'))
    expect(formatRelativeTime('2026-02-07T12:00:00Z')).toBe('1 hour ago')
  })

  it('returns "X hours ago" for less than a day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-07T20:00:00Z'))
    expect(formatRelativeTime('2026-02-07T12:00:00Z')).toBe('8 hours ago')
  })

  it('returns "1 day ago" for exactly 1 day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-08T12:00:00Z'))
    expect(formatRelativeTime('2026-02-07T12:00:00Z')).toBe('1 day ago')
  })

  it('returns "X days ago" for multiple days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-14T12:00:00Z'))
    expect(formatRelativeTime('2026-02-07T12:00:00Z')).toBe('7 days ago')
  })
})
