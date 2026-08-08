import { NotFoundException } from '@nestjs/common'

export async function expectNotFoundPropagation(
  method: { mockRejectedValue: (value: unknown) => unknown },
  invoke: () => Promise<unknown>,
): Promise<void> {
  method.mockRejectedValue(new NotFoundException())
  await expect(invoke()).rejects.toThrow(NotFoundException)
}

export async function expectPageAndLimitApplied(
  qr: { query: jest.Mock },
  makeRow: () => Record<string, unknown>,
  findAll: (query: { page: number; limit: number }) => Promise<{ page?: number; limit?: number }>,
): Promise<void> {
  qr.query.mockResolvedValueOnce([{ count: '50' }]).mockResolvedValueOnce([makeRow()])

  const result = await findAll({ page: 3, limit: 10 })

  expect(result.page).toBe(3)
  expect(result.limit).toBe(10)
  const listQuery = (qr.query.mock.calls as unknown[][])[1]?.[0] as string
  expect(listQuery).toContain('OFFSET')
}
