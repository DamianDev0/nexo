export type ScoreBand = 'high' | 'medium' | 'low'

export const CONTACT_HIGH_SCORE = 70

export const CONTACT_MEDIUM_SCORE = 40

export const CONTACT_GROW_COLUMN = 'name'

export const CONTACT_COLUMN_ALIGN: Readonly<Record<string, 'start' | 'center' | 'end'>> = {
  leadScore: 'end',
}

export const CONTACT_TAG_CHIP =
  'inline-flex h-5.5 items-center rounded-md bg-muted px-1.5 text-xs font-medium text-body'

export const CONTACT_STALE_DAYS = 30

export const CONTACT_SCORE_DOT: Readonly<Record<ScoreBand, string>> = {
  high: 'bg-positive',
  medium: 'bg-warning-deep',
  low: 'bg-faint',
}

export const CONTACT_SCORE_LABEL_KEY: Readonly<Record<ScoreBand, string>> = {
  high: 'contacts.score.high',
  medium: 'contacts.score.medium',
  low: 'contacts.score.low',
}

export const CONTACT_NAME_TEXT = 'text-sm font-medium tracking-tight text-foreground'

export const CONTACT_STRIP_BUTTON =
  'relative size-5 rounded-sm text-muted-foreground hover:text-foreground'
