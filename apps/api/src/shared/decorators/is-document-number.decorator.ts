import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator'
import { DocumentType } from '@repo/shared-types'
import { validateDocumentNumber } from '@repo/shared-utils'

const KNOWN_TYPES = new Set<string>(Object.values(DocumentType))

function documentTypeOf(args: ValidationArguments, typeProperty: string): DocumentType | null {
  const raw = (args.object as Record<string, unknown>)[typeProperty]
  return typeof raw === 'string' && KNOWN_TYPES.has(raw) ? (raw as DocumentType) : null
}

export function IsDocumentNumberFor(
  typeProperty: string,
  options?: ValidationOptions,
): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      name: 'isDocumentNumberFor',
      target: target.constructor,
      propertyName: String(propertyKey),
      constraints: [typeProperty],
      options,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== 'string') return false
          const type = documentTypeOf(args, typeProperty)
          return type === null || validateDocumentNumber(type, value).isValid
        },
        defaultMessage(args: ValidationArguments) {
          const type = documentTypeOf(args, typeProperty)
          const value = typeof args.value === 'string' ? args.value : ''
          return type === null
            ? `${args.property} must be a string`
            : (validateDocumentNumber(type, value).error ?? `${args.property} is invalid`)
        },
      },
    })
  }
}
