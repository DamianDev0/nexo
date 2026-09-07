import type { RecordDrawerLabels } from '../types'
import type { TFunction } from 'i18next'

export function buildRecordDrawerLabels(t: TFunction): RecordDrawerLabels {
  return {
    title: t('recordDrawer.title'),
    prev: t('recordDrawer.prev'),
    next: t('recordDrawer.next'),
    close: t('recordDrawer.close'),
  }
}
