import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { Tenant } from '../entities/tenant.entity'
import { UserTenantMap } from '../entities/user-tenant-map.entity'
import { UserTenantMapRepository } from '../repositories/user-tenant-map.repository'
import { UserTenantMapService } from '../services/user-tenant-map.service'

const EMAIL = 'Damian@Acme.CO'

function makeTenant(overrides: Partial<Tenant> = {}): Tenant {
  return { id: 'tenant-1', slug: 'acme', isActive: true, ...overrides } as Tenant
}

function makeMapping(tenant: Tenant | null): UserTenantMap {
  return { id: 'map-1', email: 'damian@acme.co', tenantId: tenant?.id, tenant } as UserTenantMap
}

describe('UserTenantMapService', () => {
  let service: UserTenantMapService
  let mapRepo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock; create: jest.Mock }

  beforeEach(async () => {
    mapRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        UserTenantMapService,
        { provide: getRepositoryToken(UserTenantMap), useValue: mapRepo },
        { provide: getRepositoryToken(Tenant), useValue: { find: jest.fn() } },
        { provide: UserTenantMapRepository, useValue: { findActiveUserEmails: jest.fn() } },
      ],
    }).compile()

    service = module.get(UserTenantMapService)
  })

  describe('findTenantByEmail', () => {
    it('lowercases the email and asks for the oldest mapping first', async () => {
      mapRepo.find.mockResolvedValue([makeMapping(makeTenant())])

      await service.findTenantByEmail(EMAIL)

      expect(mapRepo.find).toHaveBeenCalledWith({
        where: { email: 'damian@acme.co' },
        relations: ['tenant'],
        order: { createdAt: 'ASC' },
      })
    })

    it('always picks the same workspace when one email maps to several', async () => {
      const oldest = makeTenant({ id: 'tenant-old', slug: 'damian-tech' })
      mapRepo.find.mockResolvedValue([
        makeMapping(oldest),
        makeMapping(makeTenant({ id: 'tenant-new', slug: 'damiantest' })),
      ])

      await expect(service.findTenantByEmail(EMAIL)).resolves.toBe(oldest)
    })

    it('skips deactivated workspaces the tenant middleware would reject anyway', async () => {
      const active = makeTenant({ id: 'tenant-live', slug: 'live' })
      mapRepo.find.mockResolvedValue([
        makeMapping(makeTenant({ id: 'tenant-dead', isActive: false })),
        makeMapping(active),
      ])

      await expect(service.findTenantByEmail(EMAIL)).resolves.toBe(active)
    })

    it('returns null when every mapped workspace is deactivated', async () => {
      mapRepo.find.mockResolvedValue([makeMapping(makeTenant({ isActive: false }))])

      await expect(service.findTenantByEmail(EMAIL)).resolves.toBeNull()
    })

    it('returns null when the email is mapped nowhere', async () => {
      mapRepo.find.mockResolvedValue([])

      await expect(service.findTenantByEmail(EMAIL)).resolves.toBeNull()
    })
  })
})
