import { registerDecorator, type ValidationOptions } from 'class-validator'
import { isValidCOPhone } from '@repo/shared-utils'

export function IsCOPhone(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      name: 'isCOPhone',
      target: target.constructor,
      propertyName: String(propertyKey),
      options: {
        message: `${String(propertyKey)} must be a valid Colombian phone number`,
        ...options,
      },
      validator: {
        validate: (value: unknown) => typeof value === 'string' && isValidCOPhone(value),
      },
    })
  }
}
