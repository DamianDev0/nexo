import { PillButton } from '@/shared/ui/atoms/pill-button'
import { PlusIcon } from '@/shared/ui/icons'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { HintTooltip } from './hint-tooltip'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Molecules/HintTooltip',
  component: HintTooltip,
  parameters: { layout: 'centered', chromatic: { disableSnapshot: true } },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof HintTooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    hint: 'Crear contacto',
    asChild: true,
    children: (
      <PillButton variant="icon" size="sm" aria-label="Crear contacto">
        <PlusIcon className="size-4" />
      </PillButton>
    ),
  },
}

export const WorstCase: Story = {
  args: {
    hint: 'Un hint absurdamente largo que explica demasiadas cosas y debería ser texto de ayuda, no un tooltip',
    asChild: true,
    children: (
      <PillButton variant="outline" size="sm">
        Hover aquí
      </PillButton>
    ),
  },
}
