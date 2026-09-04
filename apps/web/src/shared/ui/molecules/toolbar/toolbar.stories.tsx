import { expect, screen, userEvent, within } from 'storybook/test'

import { SHORTCUTS } from '@/shared/config/shortcuts'
import {
  ArrowClockwiseIcon,
  ArrowUUpLeftIcon,
  CopyIcon,
  DotsThreeIcon,
  FunnelIcon,
  GearIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from '@/shared/ui/icons'

import { Toolbar } from './index'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const FORMAT_TOOLS = [
  { value: 'bold', label: 'Negrita', keys: SHORTCUTS.bold, icon: TextBIcon },
  { value: 'italic', label: 'Cursiva', keys: SHORTCUTS.italic, icon: TextItalicIcon },
  { value: 'underline', label: 'Subrayado', keys: SHORTCUTS.underline, icon: TextUnderlineIcon },
  { value: 'strike', label: 'Tachado', keys: SHORTCUTS.strikethrough, icon: TextStrikethroughIcon },
] as const

const ALIGN_TOOLS = [
  { value: 'left', label: 'Alinear izquierda', icon: TextAlignLeftIcon },
  { value: 'center', label: 'Centrar', icon: TextAlignCenterIcon },
  { value: 'right', label: 'Alinear derecha', icon: TextAlignRightIcon },
  { value: 'justify', label: 'Justificar', icon: TextAlignJustifyIcon },
] as const

const meta = {
  title: 'Molecules/Toolbar',
  component: Toolbar,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Toolbar>

export default meta
type Story = StoryObj<typeof meta>

export const RichTextEditor: Story = {
  render: () => (
    <Toolbar aria-label="Formato de texto">
      <Toolbar.Group>
        <Toolbar.Button aria-label="Deshacer" hint={{ label: 'Deshacer', keys: SHORTCUTS.undo }}>
          <ArrowUUpLeftIcon />
        </Toolbar.Button>
        <Toolbar.Button aria-label="Rehacer" hint={{ label: 'Rehacer', keys: SHORTCUTS.redo }}>
          <ArrowClockwiseIcon />
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.ToggleGroup type="multiple" aria-label="Formato">
        {FORMAT_TOOLS.map(({ value, label, keys, icon: Icon }) => (
          <Toolbar.ToggleItem key={value} value={value} aria-label={label} hint={{ label, keys }}>
            <Icon />
          </Toolbar.ToggleItem>
        ))}
      </Toolbar.ToggleGroup>
      <Toolbar.Separator />
      <Toolbar.ToggleGroup type="single" defaultValue="left" aria-label="Alineación">
        {ALIGN_TOOLS.map(({ value, label, icon: Icon }) => (
          <Toolbar.ToggleItem key={value} value={value} aria-label={label} hint={{ label }}>
            <Icon />
          </Toolbar.ToggleItem>
        ))}
      </Toolbar.ToggleGroup>
      <Toolbar.Separator />
      <Toolbar.Group>
        <Toolbar.Button aria-label="Lista" hint={{ label: 'Lista', keys: SHORTCUTS.bulletList }}>
          <ListBulletsIcon />
        </Toolbar.Button>
        <Toolbar.Button
          aria-label="Lista numerada"
          hint={{ label: 'Lista numerada', keys: SHORTCUTS.numberedList }}
        >
          <ListNumbersIcon />
        </Toolbar.Button>
      </Toolbar.Group>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Negrita' }))
    await expect(canvas.getByRole('button', { name: 'Negrita' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await userEvent.hover(canvas.getByRole('button', { name: 'Cursiva' }))
    const keys = await screen.findAllByText('I')
    await expect(keys.length).toBeGreaterThan(0)
  },
}

export const WithMenu: Story = {
  render: () => (
    <Toolbar aria-label="Acciones de la vista">
      <Toolbar.Button aria-label="Copiar" hint={{ label: 'Copiar', keys: SHORTCUTS.copy }}>
        <CopyIcon />
      </Toolbar.Button>
      <Toolbar.Toggle
        aria-label="Filtros"
        hint={{ label: 'Filtros', keys: SHORTCUTS.toggleFilters }}
      >
        <FunnelIcon />
      </Toolbar.Toggle>
      <Toolbar.Separator />
      <Toolbar.Menu>
        <Toolbar.MenuTrigger aria-label="Más acciones" hint={{ label: 'Más acciones' }}>
          <DotsThreeIcon />
        </Toolbar.MenuTrigger>
        <Toolbar.MenuContent align="end">
          <Toolbar.MenuItem>
            <GearIcon />
            Configurar
          </Toolbar.MenuItem>
          <Toolbar.MenuSeparator />
          <Toolbar.MenuItem variant="destructive">Eliminar</Toolbar.MenuItem>
        </Toolbar.MenuContent>
      </Toolbar.Menu>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Filtros' }))
    await expect(canvas.getByRole('button', { name: 'Filtros' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Más acciones' }))
    await expect(await screen.findByRole('menuitem', { name: 'Configurar' })).toBeVisible()
  },
}

export const TextTrigger: Story = {
  render: () => (
    <Toolbar aria-label="Acciones masivas">
      <Toolbar.Button size="text">
        <CopyIcon />
        Duplicar
      </Toolbar.Button>
      <Toolbar.Separator />
      <Toolbar.Popover>
        <Toolbar.PopoverTrigger size="text" hint={{ label: 'Ajustes de columna' }}>
          <GearIcon />
          Columnas
        </Toolbar.PopoverTrigger>
        <Toolbar.PopoverContent className="w-56">
          <FunnelIcon />
        </Toolbar.PopoverContent>
      </Toolbar.Popover>
    </Toolbar>
  ),
}
