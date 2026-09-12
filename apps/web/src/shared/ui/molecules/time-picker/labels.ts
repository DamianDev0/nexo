import type { TFunction } from 'i18next'

export type TimePickerLabels = {
  readonly trigger: string
  readonly hours: string
  readonly minutes: string
  readonly meridiem: string
}

export function buildTimePickerLabels(t: TFunction, trigger: string): TimePickerLabels {
  return {
    trigger,
    hours: t('timePicker.hours'),
    minutes: t('timePicker.minutes'),
    meridiem: t('timePicker.meridiem'),
  }
}
