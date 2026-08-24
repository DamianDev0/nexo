import { Text } from './text'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const VARIANTS = [
  'body',
  'muted',
  'hint',
  'strong',
  'emphasis',
  'overline',
  'kicker',
  'caption',
] as const

const meta = {
  title: 'Atoms/Text',
  component: Text,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    as: { control: 'inline-radio', options: ['span', 'p', 'dt', 'dd'] },
  },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Los campos personalizados guardan la información propia de tu negocio.' },
}

export const AllVariants: Story = {
  args: { children: 'Texto' },
  render: () => (
    <dl className="flex w-96 flex-col gap-3">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-baseline justify-between gap-6">
          <Text as="dt" variant="caption">
            {variant}
          </Text>
          <Text as="dd" variant={variant}>
            Tu base de clientes vive aquí
          </Text>
        </div>
      ))}
    </dl>
  ),
}
