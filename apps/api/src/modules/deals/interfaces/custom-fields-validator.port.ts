import type { CustomFieldEntity } from '@repo/shared-types'

export type CustomFieldsValidatorPort = {
  validate(
    tenantId: string,
    entity: CustomFieldEntity,
    values: Record<string, unknown> | undefined,
  ): Promise<void>
}
