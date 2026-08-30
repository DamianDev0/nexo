import { InternalServerErrorException } from '@nestjs/common'

export function toCents(value: string | number | null | undefined): number {
  const cents = Number(value ?? 0)
  if (!Number.isInteger(cents)) {
    throw new InternalServerErrorException(`Money value is not an integer cent amount: ${value}`)
  }
  return cents
}
