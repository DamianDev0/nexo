import { TAXONOMY_COLOR_PALETTE } from '@repo/shared-types'

export const HEX_COLOR_PALETTE: ReadonlyArray<string> = TAXONOMY_COLOR_PALETTE.filter((color) =>
  color.startsWith('#'),
)
