import type { TFunction } from 'i18next'

export type ComposerControlLabels = {
  readonly minimize: string
  readonly expand: string
  readonly close: string
  readonly drag: string
}

export function buildComposerControlLabels(t: TFunction): ComposerControlLabels {
  return {
    minimize: t('composer.controls.minimize'),
    expand: t('composer.controls.expand'),
    close: t('composer.controls.close'),
    drag: t('composer.controls.drag'),
  }
}
