export const CONTACT_GROW_COLUMN = 'name'

export const CONTACT_COLUMN_ALIGN: Readonly<Record<string, 'start' | 'center' | 'end'>> = {}

export const CONTACT_TAG_CHIP =
  'inline-flex h-5.5 items-center rounded-md bg-muted px-1.5 text-xs font-medium text-body'

export const CONTACT_STALE_DAYS = 30

export const CONTACT_NAME_TEXT = 'text-sm font-medium tracking-tight text-foreground'

export const CONTACT_STRIP_BUTTON =
  'relative size-5 rounded-sm text-muted-foreground hover:text-foreground'

export const CONTACT_REQUIRED_FIELDS = ['email', 'phone', 'documentNumber'] as const

export const CONTACT_ADDRESS_KEY = 'address'
