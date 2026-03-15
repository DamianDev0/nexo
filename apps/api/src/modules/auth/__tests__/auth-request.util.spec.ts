import type { Request, Response } from 'express'
import {
  extractMeta,
  setAuthCookies,
  extractCookie,
  clearAuthCookies,
} from '../utils/auth-request.util'
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_COOKIE_PATH,
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
} from '../constants/auth-cookies.constants'

function mockRequest(overrides: Partial<Request> = {}): Request {
  return {
    ip: undefined,
    socket: { remoteAddress: undefined },
    headers: {},
    cookies: {},
    app: { get: jest.fn() },
    ...overrides,
  } as unknown as Request
}

function mockResponse(): jest.Mocked<Pick<Response, 'cookie' | 'clearCookie'>> {
  return { cookie: jest.fn(), clearCookie: jest.fn() }
}

describe('auth-request.util', () => {
  describe('extractMeta', () => {
    it('extracts IP from req.ip', () => {
      const req = mockRequest({ ip: '192.168.1.1' })
      expect(extractMeta(req).ip).toBe('192.168.1.1')
    })

    it('strips IPv4-mapped IPv6 prefix from IP', () => {
      const req = mockRequest({ ip: '::ffff:10.0.0.1' })
      expect(extractMeta(req).ip).toBe('10.0.0.1')
    })

    it('falls back to socket.remoteAddress when req.ip is absent', () => {
      const req = mockRequest({
        ip: undefined,
        socket: { remoteAddress: '10.0.0.2' } as never,
      })
      expect(extractMeta(req).ip).toBe('10.0.0.2')
    })

    it('returns "unknown" when IP cannot be resolved', () => {
      const req = mockRequest({ ip: undefined, socket: {} as never })
      expect(extractMeta(req).ip).toBe('unknown')
    })

    it('extracts User-Agent string header', () => {
      const req = mockRequest({ headers: { 'user-agent': 'Mozilla/5.0' } })
      expect(extractMeta(req).userAgent).toBe('Mozilla/5.0')
    })

    it('picks first element when User-Agent is an array', () => {
      const req = mockRequest({ headers: { 'user-agent': ['Chrome/90', 'Safari'] as never } })
      expect(extractMeta(req).userAgent).toBe('Chrome/90')
    })

    it('returns "unknown" when User-Agent header is absent', () => {
      const req = mockRequest({ headers: {} })
      expect(extractMeta(req).userAgent).toBe('unknown')
    })
  })

  describe('setAuthCookies', () => {
    it('sets access and refresh cookies with httpOnly and sameSite strict', () => {
      const req = mockRequest({ app: { get: jest.fn().mockReturnValue('development') } as never })
      const res = mockResponse()

      setAuthCookies(res as never, 'access-token', 'refresh-token', req)

      expect(res.cookie).toHaveBeenCalledWith(
        ACCESS_COOKIE,
        'access-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: ACCESS_TOKEN_MAX_AGE_MS,
        }),
      )
      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_COOKIE,
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: REFRESH_TOKEN_MAX_AGE_MS,
          path: REFRESH_COOKIE_PATH,
        }),
      )
    })

    it('sets secure: true in production', () => {
      const req = mockRequest({ app: { get: jest.fn().mockReturnValue('production') } as never })
      const res = mockResponse()

      setAuthCookies(res as never, 'a', 'r', req)

      expect(res.cookie).toHaveBeenCalledWith(
        ACCESS_COOKIE,
        'a',
        expect.objectContaining({ secure: true }),
      )
    })

    it('sets secure: false outside production', () => {
      const req = mockRequest({ app: { get: jest.fn().mockReturnValue('development') } as never })
      const res = mockResponse()

      setAuthCookies(res as never, 'a', 'r', req)

      expect(res.cookie).toHaveBeenCalledWith(
        ACCESS_COOKIE,
        'a',
        expect.objectContaining({ secure: false }),
      )
    })
  })

  describe('extractCookie', () => {
    it('returns the cookie value by name', () => {
      const req = mockRequest({ cookies: { [REFRESH_COOKIE]: 'mytoken' } })
      expect(extractCookie(req, REFRESH_COOKIE)).toBe('mytoken')
    })

    it('returns undefined when the cookie is absent', () => {
      const req = mockRequest({ cookies: {} })
      expect(extractCookie(req, REFRESH_COOKIE)).toBeUndefined()
    })

    it('returns undefined when cookies object is undefined', () => {
      const req = mockRequest({ cookies: undefined as never })
      expect(extractCookie(req, REFRESH_COOKIE)).toBeUndefined()
    })
  })

  describe('clearAuthCookies', () => {
    it('clears access and refresh cookies', () => {
      const res = mockResponse()

      clearAuthCookies(res as never)

      expect(res.clearCookie).toHaveBeenCalledWith(ACCESS_COOKIE)
      expect(res.clearCookie).toHaveBeenCalledWith(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH })
    })
  })
})
