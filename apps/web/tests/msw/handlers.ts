import {
  ContactSource,
  ContactStatus,
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
  ContactListItem,
  GeneralSettings,
  MeResponse,
  PaginatedContacts,
} from '@repo/shared-types'

function buildContact(overrides: Partial<ContactListItem>): ContactListItem {
  return {
    id: 'contact-1',
    firstName: 'Maria',
    lastName: 'Lopez',
    email: 'maria@nexo.test',
    phone: '+57 300 000 0000',
    whatsapp: null,
    documentType: DocumentType.CC,
    documentNumber: '123456789',
    jobTitle: null,
    linkedinUrl: null,
    birthday: null,
    address: null,
    city: 'Bogota',
    department: null,
    municipioCode: null,
    country: 'CO',
    status: ContactStatus.NEW,
    lifecycleStage: LifecycleStage.LEAD,
    source: ContactSource.MANUAL,
    leadScore: 0,
    dataConsent: true,
    consentDate: null,
    consentSource: null,
    optOutEmail: false,
    optOutSms: false,
    optOutWhatsapp: false,
    lastContactedAt: null,
    tags: [],
    companyId: null,
    assignedToId: null,
    isActive: true,
    createdById: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export const CONTACTS_FIXTURE: ContactListItem[] = [
  buildContact({ id: 'contact-1', firstName: 'Maria', lastName: 'Lopez' }),
  buildContact({
    id: 'contact-2',
    firstName: 'Carlos',
    lastName: 'Perez',
    status: ContactStatus.CLIENT,
  }),
]

export const handlers = [
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
