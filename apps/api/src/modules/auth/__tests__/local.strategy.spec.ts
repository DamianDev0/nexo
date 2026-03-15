import { UnauthorizedException } from '@nestjs/common'
import { UserRole } from '@repo/shared-types'
import type { TenantContext } from '@repo/shared-types'
import { LocalStrategy } from '../strategies/local.strategy'
import type { AuthService } from '../services/auth.service'

const mockTenantCtx: TenantContext = {
  tenantId: 'tenant-1',
  slug: 'acme',
  schemaName: 'tenant_acme',
  plan: 'free',
  config: {},
}

const mockUser = {
  id: 'user-1',
  email: 'owner@acme.com',
  full_name: 'John Doe',
  role: UserRole.OWNER,
  is_active: true,
  password_hash: '$hash',
  avatar_url: null,
}

function buildStrategy(validateUser = jest.fn()) {
  const authService = { validateUser } as unknown as AuthService
  return new LocalStrategy(authService)
}

function buildReq(tenantCtx: TenantContext | undefined, ip = '127.0.0.1') {
  return {
    tenantContext: tenantCtx,
    ip,
    socket: { remoteAddress: ip },
  }
}

describe('LocalStrategy', () => {
  describe('validate', () => {
    it('throws UnauthorizedException when tenantContext is missing', async () => {
      const strategy = buildStrategy()
      const req = buildReq(undefined)

      await expect(strategy.validate(req as any, 'x@x.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('delegates to AuthService.validateUser with correct args', async () => {
      const validateUser = jest.fn().mockResolvedValue(mockUser)
      const strategy = buildStrategy(validateUser)
      const req = buildReq(mockTenantCtx, '10.0.0.1')

      const result = await strategy.validate(req as any, 'owner@acme.com', 'secret')

      expect(validateUser).toHaveBeenCalledWith(
        'owner@acme.com',
        'secret',
        'tenant_acme',
        '10.0.0.1',
      )
      expect(result).toEqual(mockUser)
    })

    it('strips IPv4-mapped IPv6 prefix from ip address', async () => {
      const validateUser = jest.fn().mockResolvedValue(mockUser)
      const strategy = buildStrategy(validateUser)
      const req = {
        ...buildReq(mockTenantCtx),
        ip: '::ffff:192.168.1.1',
        socket: { remoteAddress: '::ffff:192.168.1.1' },
      }

      await strategy.validate(req as any, 'owner@acme.com', 'secret')

      expect(validateUser).toHaveBeenCalledWith(
        'owner@acme.com',
        'secret',
        'tenant_acme',
        '192.168.1.1',
      )
    })

    it('propagates UnauthorizedException from AuthService', async () => {
      const validateUser = jest.fn().mockRejectedValue(new UnauthorizedException())
      const strategy = buildStrategy(validateUser)
      const req = buildReq(mockTenantCtx)

      await expect(strategy.validate(req as any, 'bad@acme.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })
})
