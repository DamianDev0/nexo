export interface TokenEntry {
  readonly name: string
  readonly variable: string
}

export interface TokenGroup {
  readonly title: string
  readonly tokens: ReadonlyArray<TokenEntry>
}

function entry(name: string): TokenEntry {
  return { name, variable: `--${name}` }
}

export const TOKEN_GROUPS: ReadonlyArray<TokenGroup> = [
  {
    title: 'Brand',
    tokens: [
      entry('primary'),
      entry('primary-hover'),
      entry('primary-pressed'),
      entry('primary-pale'),
      entry('primary-deep'),
      entry('primary-foreground'),
    ],
  },
  {
    title: 'Surface',
    tokens: [
      entry('background'),
      entry('card'),
      entry('popover'),
      entry('sidebar'),
      entry('muted'),
      entry('row-divider'),
      entry('border'),
      entry('border-strong'),
    ],
  },
  {
    title: 'Text',
    tokens: [
      entry('foreground'),
      entry('body'),
      entry('muted-foreground'),
      entry('faint'),
      entry('disabled-fg'),
    ],
  },
  {
    title: 'Semantic',
    tokens: [
      entry('positive'),
      entry('positive-surface'),
      entry('positive-text'),
      entry('warning'),
      entry('warning-surface'),
      entry('warning-text'),
      entry('destructive'),
      entry('negative-surface'),
      entry('negative-text'),
      entry('info'),
      entry('info-surface'),
      entry('info-text'),
    ],
  },
] as const

export const WHITE_LABEL_CONTRACT = [
  '--primary',
  '--primary-foreground',
  '--primary-pale',
  '--font-ui',
] as const
