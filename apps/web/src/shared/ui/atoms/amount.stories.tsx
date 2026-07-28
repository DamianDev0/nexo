import { Amount } from './amount'
import { AMOUNT_FIXTURES } from './amount.fixtures'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Atoms/Amount',
  component: Amount,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['display', 'compact', 'inline'] },
  },
} satisfies Meta<typeof Amount>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { cents: AMOUNT_FIXTURES.dealValue },
}

export const Display: Story = {
  args: { cents: AMOUNT_FIXTURES.pipeline, variant: 'display' },
}

export const Compact: Story = {
  args: { cents: AMOUNT_FIXTURES.pipeline, variant: 'compact' },
}

export const Inline: Story = {
  args: { cents: AMOUNT_FIXTURES.dealValue, variant: 'inline' },
}

export const Voided: Story = {
  args: { cents: AMOUNT_FIXTURES.lost, voided: true },
}

export const ForeignCurrency: Story = {
  args: { cents: AMOUNT_FIXTURES.foreignUsd, currency: 'USD' },
}

export const WorstCase: Story = {
  args: { cents: AMOUNT_FIXTURES.zero },
  render: () => (
    <div className="flex flex-col items-end gap-2">
      <Amount cents={AMOUNT_FIXTURES.huge} />
      <Amount cents={AMOUNT_FIXTURES.zero} />
      <Amount cents={AMOUNT_FIXTURES.lost} voided />
      <Amount cents={AMOUNT_FIXTURES.foreignUsd} currency="USD" />
      <Amount cents={AMOUNT_FIXTURES.dealValue} />
    </div>
  ),
}

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { cents: AMOUNT_FIXTURES.dealValue, variant: 'inline', currency: 'COP', voided: false },
}
