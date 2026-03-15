import { type ExecutionContext } from '@nestjs/common'
import { type Reflector } from '@nestjs/core'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { IS_PUBLIC_KEY } from '@/shared/decorators/public.decorator'

function buildContext(_isPublic: boolean): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext
}

function buildReflector(isPublic: boolean): Reflector {
  return {
    getAllAndOverride: jest.fn((key) => (key === IS_PUBLIC_KEY ? isPublic : undefined)),
  } as unknown as Reflector
}

describe('JwtAuthGuard', () => {
  it('returns true immediately for @Public() routes', () => {
    const guard = new JwtAuthGuard(buildReflector(true))
    const ctx = buildContext(true)
    const result = guard.canActivate(ctx)
    expect(result).toBe(true)
  })

  it('delegates to passport JWT validation for protected routes', async () => {
    const reflector = buildReflector(false)
    const guard = new JwtAuthGuard(reflector)
    const superActivate = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(true)

    const ctx = buildContext(false)
    await guard.canActivate(ctx)

    expect(superActivate).toHaveBeenCalledWith(ctx)
    superActivate.mockRestore()
  })
})
