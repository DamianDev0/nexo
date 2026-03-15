import type { ConfigService } from '@nestjs/config'
import type { ThrottlerModuleOptions } from '@nestjs/throttler'

export function createThrottlerOptions(config: ConfigService): ThrottlerModuleOptions {
  const isProd = config.get<string>('app.nodeEnv') === 'production'

  return {
    throttlers: [
      {
        name: 'default',
        ttl: 60_000, // 60-second window (ms)
        limit: isProd ? 100 : 1000,
      },
    ],
  }
}
