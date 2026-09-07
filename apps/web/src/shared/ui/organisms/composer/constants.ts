export const HIDDEN_WHEN_MINIMIZED = 'group-data-minimized/composer:hidden'

export const COMPOSER_PLACEMENT = {
  corner: 'right-40 bottom-6 max-w-[calc(100dvw-11.5rem)]',
  aside:
    'top-1/2 right-118 -translate-y-1/2 max-w-[calc(100dvw-31rem)] data-maximized:translate-y-0',
} as const

export type ComposerPlacement = keyof typeof COMPOSER_PLACEMENT
