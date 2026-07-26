import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

export const API = 'http://localhost:8080/api/v1'

export function createMswServer() {
  const server = setupServer()
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
  return server
}
