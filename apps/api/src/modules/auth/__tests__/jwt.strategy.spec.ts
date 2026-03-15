import { UnauthorizedException } from '@nestjs/common'
import { type ConfigService } from '@nestjs/config'
import { UserRole } from '@repo/shared-types'
import type { JwtPayload } from '@repo/shared-types'
import { JwtStrategy } from '../strategies/jwt.strategy'

function buildStrategy(): JwtStrategy {
  const config = { get: jest.fn().mockReturnValue('mock-public-key') } as unknown as ConfigService
  return new JwtStrategy(config)
}

const validPayload: JwtPayload = {
  sub: 'user-1',
  email: 'owner@acme.com',
  role: UserRole.OWNER,
  tenantId: 'tenant-1',
  schemaName: 'tenant_acme',
}

describe('JwtStrategy', () => {
  describe('validate', () => {
    it('returns a user object for a valid payload', () => {
      const strategy = buildStrategy()
      const result = strategy.validate(validPayload)

      expect(result).toEqual({
        id: 'user-1',
        email: 'owner@acme.com',
        role: UserRole.OWNER,
        tenantId: 'tenant-1',
        schemaName: 'tenant_acme',
      })
    })

    it('throws UnauthorizedException when sub is missing', () => {
      const strategy = buildStrategy()
      const payload = { ...validPayload, sub: '' }
      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException)
    })

    it('throws UnauthorizedException when tenantId is missing', () => {
      const strategy = buildStrategy()
      const payload = { ...validPayload, tenantId: '' }
      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException)
    })

    it('throws UnauthorizedException when schemaName is missing', () => {
      const strategy = buildStrategy()
      const payload = { ...validPayload, schemaName: '' }
      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException)
    })
  })
})
