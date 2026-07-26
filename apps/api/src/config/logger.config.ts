import type { ConfigService } from '@nestjs/config'
import type { Params } from 'nestjs-pino'

export function createLoggerOptions(config: ConfigService): Params {
  const isDev = config.get<string>('app.nodeEnv') !== 'production'

  return {
    pinoHttp: {
      level: isDev ? 'debug' : 'info',

      transport: isDev
        ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
        : undefined,

      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password'],
        remove: true,
      },

      serializers: {
        req: (req: { method: string; url: string }) => ({
          method: req.method,
          url: req.url,
        }),
      },
    },
  }
}
