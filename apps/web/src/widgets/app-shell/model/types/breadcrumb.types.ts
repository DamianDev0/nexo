import type { AppIcon } from '@/shared/ui/icons'

export interface BreadcrumbCrumb {
  readonly label: string
  readonly href?: string
  readonly icon?: AppIcon
}

export type TranslateFn = (key: string) => string
export type ModuleLabelFn = (moduleKey: string, titleKey: string) => string
