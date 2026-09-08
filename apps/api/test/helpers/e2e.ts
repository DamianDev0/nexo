import { type INestApplication, ValidationPipe } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { DataSource } from 'typeorm'

import { AppModule } from '../../src/app.module'
import { TransformInterceptor } from '../../src/shared/interceptors/transform.interceptor'
import { TenantProvisioningService } from '../../src/modules/tenants/services/tenant-provisioning.service'
import { CacheService } from '../../src/shared/cache/cache.service'
import { TwilioMessagingService } from '../../src/shared/integrations/twilio/twilio-messaging.service'

export const API_PREFIX = 'api/v1'

export interface TestApp {
  app: INestApplication
  dataSource: DataSource
  provisioning: TenantProvisioningService
  cache: CacheService
}

export const FAKE_SMS_SENDER = '+15550000000'

export async function createTestApp(): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(TwilioMessagingService)
    .useValue({
      senderNumber: FAKE_SMS_SENDER,
      sendSms: () => Promise.resolve({ sid: `SM${Date.now()}`, status: 'queued', segments: 1 }),
    })
    .compile()

  const app = moduleRef.createNestApplication()
  app.use(cookieParser())
  app.setGlobalPrefix(API_PREFIX)
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  )
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)))
  await app.init()

  return {
    app,
    dataSource: moduleRef.get(DataSource),
    provisioning: moduleRef.get(TenantProvisioningService),
    cache: moduleRef.get(CacheService),
  }
}

export interface OnboardedTenant {
  slug: string
  schemaName: string
  tenantId: string
  email: string
  cookies: string[]
}

export async function onboardTenant(app: INestApplication, slug: string): Promise<OnboardedTenant> {
  const email = `owner@${slug}.co`
  const res = await request(app.getHttpServer())
    .post(`/${API_PREFIX}/auth/onboard`)
    .send({
      businessName: `Business ${slug}`,
      slug,
      ownerEmail: email,
      ownerPassword: 'Password123',
      ownerFullName: 'Owner Test',
    })
    .expect(201)

  const cookies = res.headers['set-cookie'] as unknown as string[]
  const tenant = res.body.data.tenant as { id: string; schemaName: string }
  return {
    slug,
    schemaName: tenant.schemaName,
    tenantId: tenant.id,
    email,
    cookies,
  }
}

export function asTenant(
  req: request.Test,
  tenant: Pick<OnboardedTenant, 'cookies' | 'slug'>,
): request.Test {
  return req.set('Cookie', tenant.cookies).set('x-tenant-slug', tenant.slug)
}

export async function teardownTenants(
  { dataSource, provisioning, cache }: TestApp,
  slugs: string[],
): Promise<void> {
  for (const slug of slugs) {
    const schema = `tenant_${slug.replace(/-/g, '_')}`
    await provisioning.dropTenantSchema(schema).catch(() => undefined)
    await cache.del(`tenant:slug:${slug}`)
  }
  await dataSource.query(`DELETE FROM public.tenants WHERE slug = ANY($1::text[])`, [slugs])
}
