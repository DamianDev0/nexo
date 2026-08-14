import { IndustrySector } from '@repo/shared-types'
import { CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from '@repo/shared-utils'

import {
  ChalkboardTeacherIcon,
  ChefHatIcon,
  CircuitryIcon,
  CraneTowerIcon,
  HeadsetIcon,
  KeyIcon,
  ShapesIcon,
  StethoscopeIcon,
  StorefrontIcon,
} from '@/shared/ui/icons'

import type { CompanyFormValues } from '../model/types'
import type { AppIcon } from '@/shared/ui/icons'

export const REGIONAL_DEFAULTS = {
  timezoneDisplay: TIMEZONE_OPTIONS[0].label,
  currencyDisplay: CURRENCY_OPTIONS[0].label,
} as const

export const SECTOR_ICONS: Record<IndustrySector, AppIcon> = {
  salud: StethoscopeIcon,
  educacion: ChalkboardTeacherIcon,
  inmobiliaria: KeyIcon,
  comercio: StorefrontIcon,
  servicios: HeadsetIcon,
  restaurante: ChefHatIcon,
  tecnologia: CircuitryIcon,
  construccion: CraneTowerIcon,
  otros: ShapesIcon,
}

export const COMPANY_DEFAULT_VALUES: CompanyFormValues = {
  phone: '',
  website: '',
  sector: IndustrySector.TECNOLOGIA,
}
