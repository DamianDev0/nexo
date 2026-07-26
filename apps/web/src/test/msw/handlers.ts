import { HttpResponse, http } from 'msw'

const API = 'http://localhost:8080/api/v1'

export const handlers = [
  http.get(`${API}/auth/me`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: {
        id: 'user-1',
        email: 'damian@nexo.test',
        fullName: 'Damian Garcia',
        role: 'owner',
        onboardingCompleted: true,
      },
      timestamp: new Date().toISOString(),
      path: '/auth/me',
      method: 'GET',
    }),
  ),

  http.get(`${API}/settings/general`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: {
        business: { phone: '+57 300 123 4567', website: 'https://nexo.test' },
        i18n: { timezone: 'America/Bogota', currency: 'COP' },
        industry: { sector: 'technology' },
      },
      timestamp: new Date().toISOString(),
      path: '/settings/general',
      method: 'GET',
    }),
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
      },
      { status: 401 },
    ),
  ),
]
