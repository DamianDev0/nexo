import { BadRequestException } from '@nestjs/common'
import type { CustomFieldEntity } from '@repo/shared-types'

export const VALID_ENTITIES: CustomFieldEntity[] = ['contacts', 'companies', 'deals']

export function assertValidEntity(entity: string): asserts entity is CustomFieldEntity {
  if (!VALID_ENTITIES.includes(entity as CustomFieldEntity)) {
    throw new BadRequestException(
      `Invalid entity: ${entity}. Must be one of: ${VALID_ENTITIES.join(', ')}`,
    )
  }
}
