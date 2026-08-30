import { TenantThrottlerGuard } from '../tenant-throttler.guard'

type TrackerInput = Parameters<TenantThrottlerGuard['getTracker']>[0]

class ExposedGuard extends TenantThrottlerGuard {
  track(req: TrackerInput): Promise<string> {
    return this.getTracker(req)
  }
}

const guard = Object.create(ExposedGuard.prototype) as ExposedGuard

function request(overrides: Partial<TrackerInput>): TrackerInput {
  return { ip: '10.0.0.1', ...overrides } as TrackerInput
}

describe('TenantThrottlerGuard', () => {
  it('tracks by tenant so two tenants behind one IP never share a bucket', async () => {
    const a = await guard.track(request({ tenantContext: { tenantId: 'tenant-a' } as never }))
    const b = await guard.track(request({ tenantContext: { tenantId: 'tenant-b' } as never }))
    expect(a).toBe('tenant-a')
    expect(b).toBe('tenant-b')
    expect(a).not.toBe(b)
  })

  it('falls back to the user id when no tenant is resolved', async () => {
    await expect(guard.track(request({ user: { id: 'user-1' } }))).resolves.toBe('user-1')
    await expect(guard.track(request({ user: { sub: 'sub-1' } }))).resolves.toBe('sub-1')
  })

  it('falls back to the IP for anonymous requests', async () => {
    await expect(guard.track(request({}))).resolves.toBe('10.0.0.1')
  })
})
