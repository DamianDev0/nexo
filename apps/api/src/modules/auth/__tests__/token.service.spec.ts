import { Test } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { TokenService } from '../services/token.service'
import { UserRole } from '@repo/shared-types'

describe('TokenService', () => {
  let service: TokenService
  let jwtService: jest.Mocked<JwtService>
  let config: jest.Mocked<ConfigService>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile()

    service = module.get(TokenService)
    jwtService = module.get(JwtService)
    config = module.get(ConfigService)
  })

  describe('generateAccessToken', () => {
    it('signs a JWT with RS256 and the private key from config', () => {
      config.get.mockImplementation((key: string) => {
        if (key === 'jwt.privateKey') return 'PRIVATE_KEY'
        if (key === 'jwt.accessTokenExpiresIn') return '15m'
        return undefined
      })
      jwtService.sign.mockReturnValue('signed.jwt.token')

      const payload = {
        sub: 'user-1',
        email: 'a@b.com',
        role: UserRole.OWNER,
        tenantId: 'tenant-1',
        schemaName: 'tenant_acme',
      }

      const token = service.generateAccessToken(payload)

      expect(jwtService.sign).toHaveBeenCalledWith(
        payload,
        expect.objectContaining({
          algorithm: 'RS256',
          privateKey: 'PRIVATE_KEY',
          expiresIn: '15m',
        }),
      )
      expect(token).toBe('signed.jwt.token')
    })

    it('falls back to 15m when accessTokenExpiresIn is not configured', () => {
      config.get.mockReturnValue(undefined)
      jwtService.sign.mockReturnValue('token')

      service.generateAccessToken({
        sub: 'u',
        email: 'e@e.com',
        role: UserRole.OWNER,
        tenantId: 't',
        schemaName: 's',
      })

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ expiresIn: '15m' }),
      )
    })
  })

  describe('verifyAccessToken', () => {
    it('verifies with RS256 and the public key from config', () => {
      config.get.mockReturnValue('PUBLIC_KEY')
      const payload = { sub: 'u', email: 'e', role: UserRole.OWNER, tenantId: 't', schemaName: 's' }
      jwtService.verify.mockReturnValue(payload)

      const result = service.verifyAccessToken('some.jwt')

      expect(jwtService.verify).toHaveBeenCalledWith('some.jwt', {
        algorithms: ['RS256'],
        publicKey: 'PUBLIC_KEY',
      })
      expect(result).toEqual(payload)
    })
  })

  describe('generateRefreshToken', () => {
    it('returns a 64-character hex string', () => {
      const token = service.generateRefreshToken()
      expect(token).toHaveLength(64)
      expect(token).toMatch(/^[0-9a-f]+$/)
    })

    it('returns unique values on each call', () => {
      expect(service.generateRefreshToken()).not.toBe(service.generateRefreshToken())
    })
  })

  describe('hashToken', () => {
    it('returns a consistent SHA-256 hex hash', () => {
      const hash = service.hashToken('mytoken')
      expect(hash).toHaveLength(64)
      expect(hash).toBe(service.hashToken('mytoken'))
    })

    it('returns different hashes for different inputs', () => {
      expect(service.hashToken('a')).not.toBe(service.hashToken('b'))
    })
  })
})
