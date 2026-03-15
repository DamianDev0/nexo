export const AUTH_EVENTS = {
  TENANT_ONBOARDED: 'auth.tenant.onboarded',
} as const

export class TenantOnboardedEvent {
  constructor(
    public readonly ownerEmail: string,
    public readonly ownerName: string,
    public readonly tenantName: string,
    public readonly schemaName: string,
  ) {}
}
