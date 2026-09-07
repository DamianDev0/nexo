import {
  DocumentType,
  IndustrySector,
  LifecycleStage,
  PlanName,
  UserRole,
} from '@repo/shared-types'
import { CO_TIMEZONE, CURRENCY_CODE } from '@repo/shared-utils'
import { HttpResponse, http } from 'msw'

import { API } from './test-server'

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  ContactColumnDef,
  ContactListItem,
  ContactSortField,
  ContactWorkspace,
  GeneralSettings,
  MeResponse,
  PaginatedContacts,
} from '@repo/shared-types'

export function buildContact(overrides: Partial<ContactListItem> = {}): ContactListItem {
  return {
    id: 'contact-1',
    firstName: 'Maria',
    lastName: 'Lopez',
    email: 'maria@nexo.test',
    phone: '+57 300 000 0000',
    whatsapp: null,
    documentType: DocumentType.CC,
    documentNumber: '123456789',
    city: 'Bogota',
    municipioCode: null,
    status: 'new',
    statusChangedAt: new Date().toISOString(),
    avatarUrl: null,
    lifecycleStage: LifecycleStage.LEAD,
    source: 'manual',
    lastContactedAt: null,
    tags: [],
    companyId: null,
    assignedToId: null,
    isActive: true,
    createdById: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    noteCount: 0,
    optedOutChannels: [],
    ...overrides,
  }
}

export const CONTACTS_FIXTURE: ContactListItem[] = [
  buildContact({ id: 'contact-1', firstName: 'Maria', lastName: 'Lopez' }),
  buildContact({
    id: 'contact-2',
    firstName: 'Carlos',
    lastName: 'Perez',
    status: 'client',
  }),
]

const COLUMN_KEYS = [
  'name',
  'status',
  'email',
  'phone',
  'whatsapp',
  'documentNumber',
  'lifecycleStage',
  'source',
  'tags',
  'city',
  'lastContactedAt',
  'createdAt',
] as const

const SORT_FIELD_BY_COLUMN: Partial<Record<(typeof COLUMN_KEYS)[number], ContactSortField>> = {
  name: 'firstName',
  status: 'status',
  email: 'email',
  city: 'city',
  lastContactedAt: 'lastContactedAt',
  createdAt: 'createdAt',
}

const HIDDEN_BY_DEFAULT = new Set<string>(['whatsapp', 'documentNumber'])

export const CONTACT_COLUMNS_FIXTURE: ContactColumnDef[] = COLUMN_KEYS.map((key) => ({
  key,
  labelKey: `contacts.columns.${key}`,
  hintKey: `contacts.columnHints.${key}`,
  sortField: SORT_FIELD_BY_COLUMN[key] ?? null,
  defaultVisible: !HIDDEN_BY_DEFAULT.has(key),
  defaultWidth: 150,
  minWidth: 100,
}))

export const handlers = [
  http.get(`${API}/users`, () => HttpResponse.json({ statusCode: 200, message: 'OK', data: [] })),
  http.get(`${API}/contacts/workspace`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: {
        views: [],
        activeViewId: null,
        tableState: {},
        columns: CONTACT_COLUMNS_FIXTURE,
        quickFilters: { statuses: [], sources: [], lifecycleStages: [] },
        counts: {
          total: CONTACTS_FIXTURE.length,
          archived: 0,
          mine: 2,
          unassigned: 1,
          unassignedRecent: 1,
          byStatus: {},
        },
      },
      timestamp: new Date().toISOString(),
      path: '/contacts/workspace',
      method: 'GET',
    } satisfies ApiSuccessResponse<ContactWorkspace>),
  ),

  http.patch(`${API}/contacts/workspace`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/contacts`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: {
        data: CONTACTS_FIXTURE,
        total: CONTACTS_FIXTURE.length,
        page: 1,
        limit: 25,
      },
      timestamp: new Date().toISOString(),
      path: '/contacts',
      method: 'GET',
    } satisfies ApiSuccessResponse<PaginatedContacts>),
  ),

  http.get(`${API}/auth/me`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: {
        id: 'user-1',
        email: 'damian@nexo.test',
        fullName: 'Damian Garcia',
        avatarUrl: null,
        role: UserRole.OWNER,
        tenantId: 'tenant-1',
        schemaName: 'tenant_nexo',
        onboardingCompleted: true,
      },
      timestamp: new Date().toISOString(),
      path: '/auth/me',
      method: 'GET',
    } satisfies ApiSuccessResponse<MeResponse>),
  ),

  http.get(`${API}/settings/general`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: {
        id: 'tenant-1',
        name: 'Nexo Test',
        slug: 'nexo',
        plan: PlanName.FREE,
        business: { phone: '+57 300 123 4567', website: 'https://nexo.test' },
        i18n: { timezone: CO_TIMEZONE, currency: CURRENCY_CODE },
        billing: {},
        industry: { sector: IndustrySector.TECNOLOGIA },
      },
      timestamp: new Date().toISOString(),
      path: '/settings/general',
      method: 'GET',
    } satisfies ApiSuccessResponse<GeneralSettings>),
  ),

  http.post(`${API}/auth/login`, () =>
    HttpResponse.json(
      {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
        timestamp: new Date().toISOString(),
        path: '/auth/login',
        method: 'POST',
      } satisfies ApiErrorResponse,
      { status: 401 },
    ),
  ),
]
