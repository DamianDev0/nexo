const APPLE_PATTERN = /mac|iphone|ipad|ipod/i

const APPLE_KEYS: Record<string, string> = {
  mod: '⌘',
  ctrl: '⌃',
  alt: '⌥',
  shift: '⇧',
  enter: '↵',
  backspace: '⌫',
  delete: '⌦',
  esc: 'Esc',
  tab: '⇥',
  space: 'Space',
}

const PC_KEYS: Record<string, string> = {
  mod: 'Ctrl',
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  backspace: '⌫',
  delete: 'Del',
  esc: 'Esc',
  tab: 'Tab',
  space: 'Space',
}

export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return true
  return APPLE_PATTERN.test(navigator.platform || navigator.userAgent)
}

export function formatShortcut(
  keys: readonly string[],
  apple: boolean = isApplePlatform(),
): readonly string[] {
  const symbols = apple ? APPLE_KEYS : PC_KEYS
  return keys.map((key) => {
    const symbol = symbols[key.toLowerCase()]
    if (symbol) return symbol
    return key.length === 1 ? key.toUpperCase() : key
  })
}

const KEY_ALIASES: Record<string, string> = {
  esc: 'escape',
  space: ' ',
}

type ShortcutEvent = Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey'>

export function matchesShortcut(
  event: ShortcutEvent,
  keys: readonly string[],
  apple: boolean = isApplePlatform(),
): boolean {
  let meta = false
  let ctrl = false
  let alt = false
  let shift = false
  let main: string | null = null
  for (const raw of keys) {
    const key = raw.toLowerCase()
    if (key === 'mod') {
      if (apple) meta = true
      else ctrl = true
    } else if (key === 'ctrl') ctrl = true
    else if (key === 'alt') alt = true
    else if (key === 'shift') shift = true
    else main = KEY_ALIASES[key] ?? key
  }
  if (!main) return false
  return (
    event.metaKey === meta &&
    event.ctrlKey === ctrl &&
    event.altKey === alt &&
    event.shiftKey === shift &&
    event.key.toLowerCase() === main
  )
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}
