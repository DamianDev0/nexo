import { Test } from '@nestjs/testing'
import { DEFAULT_CONTACT_TAXONOMY } from '@repo/shared-types'
import { ObjectWorkspaceService } from '@/shared/object-engine/services/object-workspace.service'
import { CONTACT_OBJECT } from '../constants/contact-object.definition'
import { ContactWorkspaceService } from '../services/contact-workspace.service'
import { ContactsService } from '../services/contacts.service'

const SCHEMA = 'tenant_acme'
const USER = 'user-1'

describe('ContactWorkspaceService', () => {
  let service: ContactWorkspaceService
  let workspace: { getWorkspace: jest.Mock }
  let contacts: { counts: jest.Mock }

  beforeEach(async () => {
    workspace = {
      getWorkspace: jest.fn().mockResolvedValue({
        views: [],
        activeViewId: null,
        tableState: {},
        columns: [],
      }),
    }
    contacts = {
      counts: jest.fn().mockResolvedValue({ total: 3, archived: 0, byStatus: { new: 3 } }),
    }

    const module = await Test.createTestingModule({
      providers: [
        ContactWorkspaceService,
        { provide: ObjectWorkspaceService, useValue: workspace },
        { provide: ContactsService, useValue: contacts },
      ],
    }).compile()

    service = module.get(ContactWorkspaceService)
  })

  it('builds the generic workspace from the contact definition and custom fields', async () => {
    const customFields = [{ key: 'eps', label: 'EPS', type: 'text' }] as never[]

    await service.getWorkspace(SCHEMA, USER, DEFAULT_CONTACT_TAXONOMY, customFields)

    expect(workspace.getWorkspace).toHaveBeenCalledWith(SCHEMA, CONTACT_OBJECT, USER, customFields)
  })

  it('adds counts and the enabled quick filter keys of the tenant taxonomy', async () => {
    const taxonomy = {
      ...DEFAULT_CONTACT_TAXONOMY,
      sources: DEFAULT_CONTACT_TAXONOMY.sources.map((option, index) => ({
        ...option,
        enabled: index === 0,
      })),
    }

    const result = await service.getWorkspace(SCHEMA, USER, taxonomy)

    expect(result.counts).toEqual({ total: 3, archived: 0, byStatus: { new: 3 } })
    expect(result.quickFilters.sources).toEqual([DEFAULT_CONTACT_TAXONOMY.sources[0]?.key])
    expect(result.quickFilters.statuses.length).toBeGreaterThan(0)
    expect(result.quickFilters.lifecycleStages.length).toBeGreaterThan(0)
  })
})
