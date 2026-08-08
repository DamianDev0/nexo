export function buildQrMock(overrides: Record<string, jest.Mock> = {}) {
  return { query: jest.fn(), ...overrides }
}

export function buildDbMock(qr: ReturnType<typeof buildQrMock>) {
  return {
    query: jest.fn((_schema: string, cb: (runner: unknown) => Promise<unknown>) => cb(qr)),
    transactional: jest.fn((_schema: string, cb: (runner: unknown) => Promise<unknown>) => cb(qr)),
  }
}
