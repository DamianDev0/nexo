import { ValidateIf } from 'class-validator'

export function IsOptionalNotNull(): PropertyDecorator {
  return ValidateIf((_, value: unknown) => value !== undefined)
}
