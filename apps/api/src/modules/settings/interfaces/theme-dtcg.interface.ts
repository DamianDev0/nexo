export interface DtcgColorToken {
  $type: 'color'
  $value: string
}

export type DtcgColorGroup = Record<string, DtcgColorToken>

export interface DtcgThemeDocument {
  $description: string
  color: {
    light: DtcgColorGroup
    dark: DtcgColorGroup
  }
}
