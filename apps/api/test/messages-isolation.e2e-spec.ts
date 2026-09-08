import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import twilio from 'twilio'

import {
  createTestApp,
  onboardTenant,
  asTenant,
  teardownTenants,
  API_PREFIX,
  FAKE_SMS_SENDER,
} from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

const MESSAGES = `/${API_PREFIX}/messaging/messages`
const WEBHOOK = `/${API_PREFIX}/messaging/twilio/status`

async function waitFor<T>(probe: () => Promise<T | null>, attempts = 20): Promise<T> {
  for (let i = 0; i < attempts; i += 1) {
    const value = await probe()
    if (value !== null) return value
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('timed out waiting for condition')
}

describe('Messages Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant
  let messageId: string
  let messageSid: string

  const SLUG_A = 'iso-messages-a'
  const SLUG_B = 'iso-messages-b'

  beforeAll(async () => {
    ctx = await createTestApp()
    app = ctx.app
    await teardownTenants(ctx, [SLUG_A, SLUG_B])
    tenantA = await onboardTenant(app, SLUG_A)
    tenantB = await onboardTenant(app, SLUG_B)
  })

  afterAll(async () => {
    await teardownTenants(ctx, [SLUG_A, SLUG_B])
    await app.close()
  })

  it('queues an sms for tenant A and delivers it through the worker', async () => {
    const res = await asTenant(request(app.getHttpServer()).post(MESSAGES), tenantA)
      .send({ channel: 'sms', to: '3001234567', body: 'Hola desde NEXO' })
      .expect(202)
    messageId = res.body.data.id as string
    expect(res.body.data).toMatchObject({
      status: 'queued',
      toNumber: '+573001234567',
      fromNumber: FAKE_SMS_SENDER,
    })

    const sent = await waitFor(async () => {
      const probe = await asTenant(
        request(app.getHttpServer()).get(`${MESSAGES}/${messageId}`),
        tenantA,
      ).expect(200)
      return probe.body.data.status === 'sent'
        ? (probe.body.data as { providerMessageSid: string })
        : null
    })
    messageSid = sent.providerMessageSid
    expect(messageSid).toMatch(/^SM/)
  })

  it("does NOT expose tenant A's message to tenant B (404)", async () => {
    await asTenant(request(app.getHttpServer()).get(`${MESSAGES}/${messageId}`), tenantB).expect(
      404,
    )
    const listB = await asTenant(request(app.getHttpServer()).get(MESSAGES), tenantB).expect(200)
    expect(listB.body.data).toEqual([])
  })

  it('logs the sent sms as a completed activity in tenant A only', async () => {
    const activities = await waitFor(async () => {
      const res = await asTenant(
        request(app.getHttpServer()).get(`/${API_PREFIX}/activities?activityType=sms`),
        tenantA,
      ).expect(200)
      return res.body.data.total > 0 ? (res.body.data.data as Array<Record<string, unknown>>) : null
    })
    expect(activities[0]).toMatchObject({
      status: 'completed',
      title: 'SMS enviado',
      description: 'Hola desde NEXO',
    })

    const activitiesB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/activities?activityType=sms`),
      tenantB,
    ).expect(200)
    expect(activitiesB.body.data.data).toEqual([])
  })

  it('rejects unsigned status webhooks and applies signed ones', async () => {
    const path = `${WEBHOOK}?tenant=${tenantA.tenantId}`
    const params = { MessageSid: messageSid, MessageStatus: 'delivered' }
    await request(app.getHttpServer()).post(path).type('form').send(params).expect(403)

    const url = `${process.env.TWILIO_WEBHOOK_BASE_URL}${path}`
    const signature = twilio.getExpectedTwilioSignature(process.env.TWILIO_AUTH_TOKEN!, url, params)
    await request(app.getHttpServer())
      .post(path)
      .set('x-twilio-signature', signature)
      .set('Host', 'random-tunnel.ngrok-free.dev')
      .type('form')
      .send(params)
      .expect(204)

    const res = await asTenant(
      request(app.getHttpServer()).get(`${MESSAGES}/${messageId}`),
      tenantA,
    ).expect(200)
    expect(res.body.data).toMatchObject({ status: 'delivered' })
    expect(res.body.data.deliveredAt).not.toBeNull()
  })

  it('rejects an invalid destination (400)', async () => {
    await asTenant(request(app.getHttpServer()).post(MESSAGES), tenantA)
      .send({ channel: 'sms', to: '12345', body: 'x' })
      .expect(400)
  })
})
