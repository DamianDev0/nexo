import { plainToInstance } from 'class-transformer'
import { IsEnum, IsInt, IsString, IsUrl, Min, validateSync } from 'class-validator'

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv

  @IsInt()
  @Min(1)
  PORT: number

  // ─── Database ──────────────────────────────────────────────────────────────

  @IsString()
  DATABASE_HOST: string

  @IsInt()
  @Min(1)
  DATABASE_PORT: number

  @IsString()
  DATABASE_USER: string

  @IsString()
  DATABASE_PASSWORD: string

  @IsString()
  DATABASE_NAME: string

  // ─── Redis ─────────────────────────────────────────────────────────────────

  @IsString()
  REDIS_HOST: string

  @IsInt()
  @Min(1)
  REDIS_PORT: number

  // ─── JWT ───────────────────────────────────────────────────────────────────

  @IsString()
  JWT_PRIVATE_KEY: string

  @IsString()
  JWT_PUBLIC_KEY: string

  // ─── App ───────────────────────────────────────────────────────────────────

  @IsString()
  COOKIE_SECRET: string

  @IsUrl({ require_tld: false })
  FRONTEND_URL: string

  // ─── Google OAuth ──────────────────────────────────────────────────────────

  @IsString()
  GOOGLE_CLIENT_ID: string

  @IsString()
  GOOGLE_CLIENT_SECRET: string

  @IsUrl({ require_tld: false })
  GOOGLE_CALLBACK_URL: string

  // ─── Email (Resend) ────────────────────────────────────────────────────────

  @IsString()
  RESEND_API_KEY: string

  @IsString()
  EMAIL_FROM: string

  // ─── AWS S3 ────────────────────────────────────────────────────────────────
  // Required by S3Service at construction (getOrThrow). Validated here so a
  // missing value fails fast at startup instead of at first DI resolution.

  @IsString()
  AWS_REGION: string

  @IsString()
  AWS_ACCESS_KEY_ID: string

  @IsString()
  AWS_SECRET_ACCESS_KEY: string

  @IsString()
  AWS_S3_BUCKET: string
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })

  const errors = validateSync(validated, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.toString()}`)
  }

  return validated
}
