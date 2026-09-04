import { fn } from 'storybook/test'

import { ActiveCallPanel } from './ActiveCallPanel'
import { CallsView } from './CallsView'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/PlaceCall/ActiveCallPanel',
  component: ActiveCallPanel,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="flex h-100 w-80 flex-col overflow-hidden rounded-lg border border-border bg-card">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActiveCallPanel>

export default meta
type Story = StoryObj<typeof meta>

const ACTIONS = { onToggleMute: fn(), onToggleHold: fn(), onHangUp: fn() }
const KEYPAD = { open: false, digits: '', onToggle: fn(), onDigit: fn() }

export const Active: Story = {
  args: {
    call: { number: '+57 301 998 4407', status: 'active', seconds: 67, muted: false, held: false },
    actions: ACTIONS,
    keypad: KEYPAD,
  },
}

export const Keypad: Story = {
  args: {
    call: { number: '+57 301 998 4407', status: 'active', seconds: 154, muted: false, held: false },
    actions: ACTIONS,
    keypad: { ...KEYPAD, open: true, digits: '12#' },
  },
}

export const OnHold: Story = {
  args: {
    call: { number: '+57 301 998 4407', status: 'active', seconds: 33, muted: true, held: true },
    actions: ACTIONS,
    keypad: KEYPAD,
  },
}

export const RecentCalls: Story = {
  args: Active.args,
  render: () => (
    <CallsView
      now={1793300000000}
      onCall={fn()}
      entries={[
        {
          id: 'a',
          number: '+573019984407',
          at: 1793290000000,
          durationSec: 154,
          outcome: 'completed',
        },
        { id: 'b', number: '3109998877', at: 1793200000000, durationSec: 0, outcome: 'canceled' },
        {
          id: 'c',
          number: '6015551234',
          at: 1793100000000,
          durationSec: 42,
          outcome: 'completed',
        },
      ]}
    />
  ),
}
