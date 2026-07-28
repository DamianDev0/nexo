import { generateKeyPairSync } from 'node:crypto'
import { NotFoundException } from '@nestjs/common'
import { sign } from 'jsonwebtoken'
import type { Request, Response } from 'express'

import { TenantMiddleware } from './tenant.middleware'
import type { Tenant } from '@/modules/tenants/entities/tenant.entity'

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})

const TENANT_ROW = {
  id: 'tenant-1',
  slug: 'acme',
  schemaName: 'tenant_acme',
  isActive: true,
  config: {},
  productName: 'Acme CRM',
  customDomain: null,
  plan: { name: 'free' },
} as unknown as Tenant

function signToken(payload: Record<string, unknown>, expiresInSeconds: number): string {
  const now = Math.floor(Date.now() / 1000)
  return sign({ ...payload, iat: now, exp: now + expiresInSeconds }, privateKey, {
    algorithm: 'RS256',
  })
}

function buildMiddleware(tenant: Tenant | null = TENANT_ROW) {
  const tenantRepo = { findOne: jest.fn().mockResolvedValue(tenant) }
  const cache = { get: jest.fn().mockResolvedValue(null), set: jest.fn() }
  const config = {
    get: jest.fn((key: string) => (key === 'jwt.publicKey' ? publicKey : 'test')),
  }
  const middleware = new TenantMiddleware(tenantRepo as never, cache as never, config as never)
  return { middleware, tenantRepo }
}

function buildRequest(overrides: Partial<Request> = {}): Request {
  return {
    headers: { host: 'localhost:8080' },
    cookies: {},
    ...overrides,
  } as Request
}

const CLAIMS = {
  sub: 'user-1',
  email: 'a@b.co',
  role: 'owner',
  tenantId: 'tenant-1',
  schemaName: 'tenant_acme',
}

describe('TenantMiddleware', () => {
  const next = jest.fn()
  const res = {} as Response

  afterEach(() => jest.clearAllMocks())

  it('resolves by x-tenant-slug header outside production', async () => {
    const { middleware, tenantRepo } = buildMiddleware()
    const req = buildRequest({ headers: { host: 'localhost:8080', 'x-tenant-slug': 'acme' } })

    await middleware.use(req, res, next)

    expect(req.tenantContext?.schemaName).toBe('tenant_acme')
    expect(tenantRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'acme', isActive: true } }),
    )
  })

  it('header slug takes precedence over the access token', async () => {
    const { middleware, tenantRepo } = buildMiddleware()
    const req = buildRequest({
      headers: { host: 'localhost:8080', 'x-tenant-slug': 'acme' },
      cookies: { access_token: signToken({ ...CLAIMS, tenantId: 'other' }, 900) },
    })

    await middleware.use(req, res, next)

    expect(tenantRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'acme', isActive: true } }),
    )
  })

  it('falls back to a valid access token when no slug is present', async () => {
    const { middleware, tenantRepo } = buildMiddleware()
    const req = buildRequest({ cookies: { access_token: signToken(CLAIMS, 900) } })

    await middleware.use(req, res, next)

    expect(req.tenantContext?.tenantId).toBe('tenant-1')
    expect(tenantRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'tenant-1', isActive: true } }),
    )
  })

  it('accepts an expired token within the grace window', async () => {
    const { middleware } = buildMiddleware()
    const req = buildRequest({ cookies: { access_token: signToken(CLAIMS, -60) } })

    await middleware.use(req, res, next)

    expect(req.tenantContext?.tenantId).toBe('tenant-1')
  })

  it('rejects a token expired beyond the grace window', async () => {
    const { middleware, tenantRepo } = buildMiddleware()
    const eightDays = 8 * 24 * 60 * 60
    const req = buildRequest({ cookies: { access_token: signToken(CLAIMS, -eightDays) } })

    await middleware.use(req, res, next)

    expect(req.tenantContext).toBeUndefined()
    expect(tenantRepo.findOne).not.toHaveBeenCalled()
  })

  it('rejects a token with an invalid signature', async () => {
    const { middleware, tenantRepo } = buildMiddleware()
    const foreignKey = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    })
    const now = Math.floor(Date.now() / 1000)
    const forged = sign({ ...CLAIMS, iat: now, exp: now + 900 }, foreignKey.privateKey, {
      algorithm: 'RS256',
    })
    const req = buildRequest({ cookies: { access_token: forged } })

    await middleware.use(req, res, next)

    expect(req.tenantContext).toBeUndefined()
    expect(tenantRepo.findOne).not.toHaveBeenCalled()
  })

  it('leaves the context empty when the token tenant is inactive or missing', async () => {
    const { middleware } = buildMiddleware(null)
    const req = buildRequest({ cookies: { access_token: signToken(CLAIMS, 900) } })

    await middleware.use(req, res, next)

    expect(req.tenantContext).toBeUndefined()
  })

  it('throws NotFound for an unknown slug', async () => {
    const { middleware } = buildMiddleware(null)
    const req = buildRequest({ headers: { host: 'localhost:8080', 'x-tenant-slug': 'ghost' } })

    await expect(middleware.use(req, res, next)).rejects.toBeInstanceOf(NotFoundException)
  })
})
