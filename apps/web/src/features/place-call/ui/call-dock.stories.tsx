import { fn } from 'storybook/test'

import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { ActiveCallPanel } from './ActiveCallPanel'
import { CallsView } from './CallsView'
import { MoreScreen } from './containers/MoreScreen'
import { DialerPanel } from './DialerPanel'
import { DockHeader } from './DockHeader'
import { DockTabBar } from './DockTabBar'
import { PhoneScreen } from './PhoneScreen'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'

function PanelFrame({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex h-110 w-75 flex-col overflow-hidden rounded-3xl bg-card shadow-e2">
        {children}
      </div>
    </TooltipProvider>
  )
}

const meta = {
  title: 'Features/PlaceCall/ActiveCallPanel',
  component: ActiveCallPanel,
  parameters: { layout: 'centered' },
  render: (args) => (
    <PanelFrame>
      <ActiveCallPanel {...args} />
    </PanelFrame>
  ),
} satisfies Meta<typeof ActiveCallPanel>

export default meta
type Story = StoryObj<typeof meta>

const ACTIONS = { onToggleMute: fn(), onToggleHold: fn(), onToggleRecord: fn(), onHangUp: fn() }
const KEYPAD = { open: false, digits: '', onToggle: fn(), onDigit: fn() }

export const Active: Story = {
  args: {
    call: {
      number: '+57 301 998 4407',
      name: 'Marcela Rueda',
      status: 'active',
      seconds: 67,
      muted: false,
      held: false,
      recording: false,
    },
    actions: ACTIONS,
    keypad: KEYPAD,
  },
}

export const Keypad: Story = {
  args: {
    call: {
      number: '+57 301 998 4407',
      name: 'Marcela Rueda',
      status: 'active',
      seconds: 154,
      muted: false,
      held: false,
      recording: false,
    },
    actions: ACTIONS,
    keypad: { ...KEYPAD, open: true, digits: '12#' },
  },
}

export const OnHold: Story = {
  args: {
    call: {
      number: '+57 301 998 4407',
      name: 'Marcela Rueda',
      status: 'active',
      seconds: 33,
      muted: true,
      held: true,
      recording: true,
    },
    actions: ACTIONS,
    keypad: KEYPAD,
  },
}

export const RecentCalls: Story = {
  args: Active.args,
  render: () => (
    <PanelFrame>
      <CallsView
        now={1793300000000}
        onCall={fn()}
        entries={[
          {
            id: 'a',
            number: '+573019984407',
            name: 'Marcela Rueda',
            at: 1793290000000,
            durationSec: 154,
            outcome: 'completed',
          },
          {
            id: 'b',
            number: '3109998877',
            name: null,
            at: 1793200000000,
            durationSec: 0,
            outcome: 'canceled',
          },
          {
            id: 'c',
            number: '6015551234',
            name: null,
            at: 1793100000000,
            durationSec: 42,
            outcome: 'completed',
          },
        ]}
      />
    </PanelFrame>
  ),
}

export const Dialpad: Story = {
  args: Active.args,
  render: () => (
    <PanelFrame>
      <div className="flex flex-1 flex-col justify-center px-4 pb-2">
        <DialerPanel
          value="+57 301 998 4407"
          canCall
          actions={{ onDigit: fn(), onDelete: fn(), onCall: fn(), onInput: fn() }}
        />
      </div>
    </PanelFrame>
  ),
}

export const FullDock: Story = {
  args: Active.args,
  render: () => (
    <TooltipProvider delayDuration={400}>
      <div className="flex w-75 flex-col overflow-hidden rounded-3xl bg-card shadow-e2">
        <DockHeader
          presence={{ label: 'Disponible', tone: 'bg-positive', onClick: fn() }}
          actions={{
            minimizeLabel: 'Minimizar',
            onMinimize: fn(),
            expandLabel: 'Expandir',
            expandHint: 'Próximamente',
            closeLabel: 'Cerrar marcador',
            onClose: fn(),
          }}
        />
        <div className="flex h-110 flex-col overflow-hidden">
          <PhoneScreen activeTab="dialpad" onSelectTab={fn()}>
            <DialerPanel
              value=""
              canCall={false}
              actions={{ onDigit: fn(), onDelete: fn(), onCall: fn(), onInput: fn() }}
            />
          </PhoneScreen>
        </div>
        <DockTabBar active="phone" onSelect={fn()} />
      </div>
    </TooltipProvider>
  ),
}

export const Settings: Story = {
  args: Active.args,
  render: () => (
    <PanelFrame>
      <MoreScreen />
    </PanelFrame>
  ),
}
