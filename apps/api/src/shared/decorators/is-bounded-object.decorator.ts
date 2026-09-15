import { registerDecorator, type ValidationOptions } from 'class-validator'

export const DEFAULT_OBJECT_MAX_KEYS = 100
export const DEFAULT_OBJECT_MAX_BYTES = 16 * 1024

type Bounds = { readonly maxKeys?: number; readonly maxBytes?: number }

export function isBoundedObject(value: unknown, bounds: Bounds = {}): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const maxKeys = bounds.maxKeys ?? DEFAULT_OBJECT_MAX_KEYS
  const maxBytes = bounds.maxBytes ?? DEFAULT_OBJECT_MAX_BYTES
  if (Object.keys(value).length > maxKeys) return false
  return Buffer.byteLength(JSON.stringify(value), 'utf8') <= maxBytes
}

export function IsBoundedObject(
  bounds: Bounds = {},
  options?: ValidationOptions,
): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      name: 'isBoundedObject',
      target: target.constructor,
      propertyName: String(propertyKey),
      options: {
        message: `${String(propertyKey)} must be an object with at most ${
          bounds.maxKeys ?? DEFAULT_OBJECT_MAX_KEYS
        } keys and ${bounds.maxBytes ?? DEFAULT_OBJECT_MAX_BYTES} bytes`,
        ...options,
      },
      validator: { validate: (value: unknown) => isBoundedObject(value, bounds) },
    })
  }
}
