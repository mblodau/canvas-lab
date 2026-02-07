import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { setupServer } from 'msw/node'
import { afterEach, beforeAll, afterAll } from 'vitest'

import { handlers } from './mocks/handlers'

// Setup MSW server for API mocking
export const server = setupServer(...handlers)

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset any request handlers that are declared as a part of our tests
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Clean up after the tests are finished
afterAll(() => server.close())
