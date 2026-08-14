export type AddressKeyAction =
  | { readonly kind: 'move'; readonly index: number }
  | { readonly kind: 'select' }
  | { readonly kind: 'close' }
  | { readonly kind: 'none' }

export function resolveAddressKey(
  key: string,
  activeIndex: number,
  optionCount: number,
): AddressKeyAction {
  if (key === 'Escape') return { kind: 'close' }
  if (optionCount === 0) return { kind: 'none' }
  if (key === 'ArrowDown') return { kind: 'move', index: (activeIndex + 1) % optionCount }
  if (key === 'ArrowUp') {
    const index = activeIndex < 0 ? optionCount - 1 : (activeIndex - 1 + optionCount) % optionCount
    return { kind: 'move', index }
  }
  if (key === 'Enter' && activeIndex >= 0) return { kind: 'select' }
  return { kind: 'none' }
}
