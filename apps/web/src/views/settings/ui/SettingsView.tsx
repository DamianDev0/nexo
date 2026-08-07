import {
  BrandPane,
  CompanySettings,
  NavigationSettings,
  NomenclatureSettings,
  SourcesPane,
  StatusPane,
  TagsPane,
  ThemePane,
  TypographyPane,
} from '@/features/manage-settings'

const PANES = {
  company: CompanySettings,
  navigation: NavigationSettings,
  nomenclature: NomenclatureSettings,
  brand: BrandPane,
  theme: ThemePane,
  typography: TypographyPane,
  contactStatus: StatusPane,
  contactSources: SourcesPane,
  contactTags: TagsPane,
} as const

export type SettingsPaneKey = keyof typeof PANES

export function SettingsView({ pane }: Readonly<{ pane: SettingsPaneKey }>) {
  const Pane = PANES[pane]
  return <Pane />
}
