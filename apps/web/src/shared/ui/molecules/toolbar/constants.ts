import { cva } from 'class-variance-authority'

export const toolbarItemVariants = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap',
    'text-muted-foreground transition-all outline-none select-none',
    'hover:bg-accent hover:text-accent-foreground',
    'focus-visible:ring-2 focus-visible:ring-ring/50',
    'active:scale-95',
    'disabled:pointer-events-none disabled:opacity-40',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
    'aria-pressed:bg-secondary aria-pressed:text-secondary-foreground aria-pressed:shadow-xs',
    'aria-checked:bg-secondary aria-checked:text-secondary-foreground aria-checked:shadow-xs',
    'aria-expanded:bg-accent aria-expanded:text-accent-foreground',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      size: {
        icon: "size-9 [&_svg:not([class*='size-'])]:size-4.5",
        'icon-sm': "size-8 [&_svg:not([class*='size-'])]:size-4",
        text: "h-9 px-2.5 text-sm [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: { size: 'icon' },
  },
)
