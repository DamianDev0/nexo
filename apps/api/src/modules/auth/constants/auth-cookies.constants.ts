export const REFRESH_COOKIE = 'refresh_token'
export const ACCESS_COOKIE = 'access_token'

/** httpOnly path for the refresh token cookie — limits exposure to the refresh endpoint only */
export const REFRESH_COOKIE_PATH = '/api/v1/auth/refresh'

export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000 // 15 minutes
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
