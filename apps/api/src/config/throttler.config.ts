import type { ConfigService } from '@nestjs/config'
import type { ThrottlerModuleOptions } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import Redis from 'ioredis'

export function createThrottlerOptions(config: ConfigService): ThrottlerModuleOptions {
  const isProd = config.get<string>('app.nodeEnv') === 'production'

  const redis = new Redis({
    host: config.get<string>('redis.host'),
    port: config.get<number>('redis.port'),
    password: config.get<string>('redis.password'),
    lazyConnect: true,
    maxRetriesPerRequest: null,
  })

  return {
    throttlers: [
      {
        name: 'default',
        ttl: 60_000,
        limit: isProd ? 100 : 1000,
      },
    ],
    storage: new ThrottlerStorageRedisService(redis),
  }
}
