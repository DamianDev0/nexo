const FLOATING_LAYER_SELECTOR = [
  '[data-slot="composer"]',
  '[data-radix-popper-content-wrapper]',
  '[role="dialog"]',
  '[role="alertdialog"]',
  '[data-sileo-toaster]',
].join(', ')

export function isFloatingLayerTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return target.closest(FLOATING_LAYER_SELECTOR) !== null
}

const RECORD_DRAWER_SELECTOR = '[data-slot="record-drawer"]'

export function isNestedFloatingLayerTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  const layer = target.closest(FLOATING_LAYER_SELECTOR)
  if (layer === null) return false
  return !layer.matches(RECORD_DRAWER_SELECTOR)
}
