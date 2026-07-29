import { CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from '@repo/shared-utils'

import type { IndustrySector } from '@repo/shared-types'

export const REGIONAL_DEFAULTS = {
  timezoneDisplay: TIMEZONE_OPTIONS[0].label,
  currencyDisplay: CURRENCY_OPTIONS[0].label,
} as const

export { COLOMBIA_FLAG_SRC, PHONE_PREFIX } from '@/shared/config/colombia'

export const SECTOR_ICON_SRC: Record<IndustrySector, string> = {
  salud: '/icons/3d/heart.png',
  educacion: '/icons/3d/notebook.png',
  inmobiliaria: '/icons/3d/key.png',
  comercio: '/icons/3d/bag.png',
  servicios: '/icons/3d/setting.png',
  restaurante: '/icons/3d/tea-cup.png',
  tecnologia: '/icons/3d/computer.png',
  construccion: '/icons/3d/tool.png',
  otros: '/icons/3d/flash.png',
}
