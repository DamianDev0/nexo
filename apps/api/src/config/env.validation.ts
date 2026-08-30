import { plainToInstance } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  ValidateIf,
  validateSync,
} from 'class-validator'

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

  @IsString()
  REDIS_HOST: string

  @IsInt()
  @Min(1)
  REDIS_PORT: number

  @ValidateIf((env: EnvironmentVariables) => env.NODE_ENV === NodeEnv.Production)
  @IsString()
  @MinLength(1)
  REDIS_PASSWORD?: string

  @IsString()
  JWT_PRIVATE_KEY: string

  @IsString()
  JWT_PUBLIC_KEY: string

  @IsString()
  COOKIE_SECRET: string

  @IsUrl({ require_tld: false })
  FRONTEND_URL: string

  @IsString()
  GOOGLE_CLIENT_ID: string

  @IsString()
  GOOGLE_CLIENT_SECRET: string

  @IsUrl({ require_tld: false })
  GOOGLE_CALLBACK_URL: string

  @IsOptional()
  @IsString()
  GOOGLE_MAPS_API_KEY?: string

  @IsString()
  RESEND_API_KEY: string

  @IsString()
  EMAIL_FROM: string

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
