import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import twilio from 'twilio'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'
import { encodeVoiceIdentity } from '../src/modules/telephony/mappers/voice-identity.mapper'

const WEBHOOK_PATH = `/${API_PREFIX}/telephony/twilio`

function signedWebhook(
  app: INestApplication,
  path: string,
  params: Record<string, string>,
): request.Test {
  const url = `${process.env.TWILIO_WEBHOOK_BASE_URL}${WEBHOOK_PATH}/${path}`
  const signature = twilio.getExpectedTwilioSignature(process.env.TWILIO_AUTH_TOKEN!, url, params)
  return request(app.getHttpServer())
    .post(`${WEBHOOK_PATH}/${path}`)
    .set('x-twilio-signature', signature)
    .type('form')
    .send(params)
}

async function currentUserId(app: INestApplication, tenant: OnboardedTenant): Promise<string> {
  const res = await asTenant(
    request(app.getHttpServer()).get(`/${API_PREFIX}/auth/me`),
    tenant,
  ).expect(200)
  return res.body.data.id as string
}

describe('Calls Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant
  let callSid: string

  const SLUG_A = 'iso-calls-a'
  const SLUG_B = 'iso-calls-b'

  beforeAll(async () => {
    ctx = await createTestApp()
    app = ctx.app
    await teardownTenants(ctx, [SLUG_A, SLUG_B])
    tenantA = await onboardTenant(app, SLUG_A)
    tenantB = await onboardTenant(app, SLUG_B)
    callSid = `CA${Date.now()}`
  })

  afterAll(async () => {
    await teardownTenants(ctx, [SLUG_A, SLUG_B])
    await app.close()
  })

  it('rejects Twilio webhooks without a valid signature (403)', async () => {
    await request(app.getHttpServer())
      .post(`${WEBHOOK_PATH}/voice`)
      .type('form')
      .send({ CallSid: 'CA0', From: 'client:x', To: '3001234567' })
      .expect(403)
  })

  it('does not resolve the public webhook host as a tenant slug', async () => {
    await signedWebhook(app, 'voice-fallback', {})
      .set('Host', 'random-tunnel.ngrok-free.dev')
      .expect(201)
  })

  it('issues a voice token bound to the caller identity', async () => {
    const userId = await currentUserId(app, tenantA)
    const res = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/telephony/voice/token`),
      tenantA,
    ).expect(200)
    expect(res.body.data.identity).toBe(encodeVoiceIdentity(tenantA.tenantId, userId))
    expect(typeof res.body.data.token).toBe('string')
  })

  it("records tenant A's outbound call from the signed voice webhook", async () => {
    const userId = await currentUserId(app, tenantA)
    const res = await signedWebhook(app, 'voice', {
      CallSid: callSid,
      From: `client:${encodeVoiceIdentity(tenantA.tenantId, userId)}`,
      To: '3001234567',
    }).expect(201)
    expect(res.headers['content-type']).toContain('text/xml')
    expect(res.text).toContain('<Dial')
    expect(res.text).toContain('+573001234567')
  })

  it("does NOT expose tenant A's call to tenant B (404)", async () => {
    const list = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/telephony/calls?limit=1`),
      tenantA,
    ).expect(200)
    const callId = list.body.data[0].id as string
    expect(list.body.data[0].providerCallSid).toBe(callSid)

    await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/telephony/calls/${callId}`),
      tenantA,
    ).expect(200)
    await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/telephony/calls/${callId}`),
      tenantB,
    ).expect(404)

    const listB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/telephony/calls`),
      tenantB,
    ).expect(200)
    expect(listB.body.data).toEqual([])
  })

  it('finalizes the call once and logs a completed activity in tenant A only', async () => {
    await signedWebhook(app, `status?tenant=${tenantA.tenantId}`, {
      CallSid: `${callSid}child`,
      ParentCallSid: callSid,
      CallStatus: 'in-progress',
      SequenceNumber: '2',
    }).expect(204)

    await signedWebhook(app, `dial-action?tenant=${tenantA.tenantId}`, {
      CallSid: callSid,
      DialCallStatus: 'completed',
      DialCallDuration: '61',
    }).expect(201)
    await signedWebhook(app, `dial-action?tenant=${tenantA.tenantId}`, {
      CallSid: callSid,
      DialCallStatus: 'completed',
      DialCallDuration: '61',
    }).expect(201)

    const call = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/telephony/calls?limit=1`),
      tenantA,
    ).expect(200)
    expect(call.body.data[0]).toMatchObject({ status: 'completed', durationSeconds: 61 })
    expect(call.body.data[0].answeredAt).not.toBeNull()

    const activitiesA = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/activities?activityType=call`),
      tenantA,
    ).expect(200)
    expect(activitiesA.body.data.data).toHaveLength(1)
    expect(activitiesA.body.data.data[0]).toMatchObject({ status: 'completed', durationMinutes: 2 })

    const activitiesB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/activities?activityType=call`),
      tenantB,
    ).expect(200)
    expect(activitiesB.body.data.data).toEqual([])
  })
})
