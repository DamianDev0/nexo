import { IndustrySector, PlanName, UserRole } from '@repo/shared-types'
import { CO_TIMEZONE, CURRENCY_CODE } from '@repo/shared-utils'
import { HttpResponse, http } from 'msw'

import { API } from './test-server'

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  GeneralSettings,
  MeResponse,
} from '@repo/shared-types'

export const handlers = [
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
