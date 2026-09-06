import {
  ActivitiesPane,
  BrandPane,
  CompanySettings,
  FieldsPane,
  LifecyclePane,
  NavigationSettings,
  NomenclatureSettings,
  PipelinesPane,
  SourcesPane,
  StatusPane,
  TagsPane,
  ThemePane,
  TrashPane,
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
  contactLifecycle: LifecyclePane,
  contactSources: SourcesPane,
  contactTags: TagsPane,
  fields: FieldsPane,
  pipelines: PipelinesPane,
  activities: ActivitiesPane,
  trash: TrashPane,
} as const

type SettingsPaneKey = keyof typeof PANES

export function SettingsView({ pane }: Readonly<{ pane: SettingsPaneKey }>) {
  const Pane = PANES[pane]
  return <Pane />
}
