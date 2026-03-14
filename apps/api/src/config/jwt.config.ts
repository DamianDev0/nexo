import { registerAs } from '@nestjs/config'

export const jwtConfig = registerAs('jwt', () => {
  const privateKeyBase64 = process.env.JWT_PRIVATE_KEY ?? ''
  const publicKeyBase64 = process.env.JWT_PUBLIC_KEY ?? ''

  // Keys are stored base64-encoded in env to avoid newline issues
  const privateKey = privateKeyBase64
    ? Buffer.from(privateKeyBase64, 'base64').toString('utf-8')
    : ''
  const publicKey = publicKeyBase64 ? Buffer.from(publicKeyBase64, 'base64').toString('utf-8') : ''

  return {
    privateKey,
    publicKey,
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d',
    refreshTokenExpiresInMs: Number.parseInt(process.env.JWT_REFRESH_EXPIRES_MS ?? '604800000', 10), // 7 days in ms
  }
})
