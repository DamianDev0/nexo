import { expect, fn, userEvent, within } from 'storybook/test'

import { SHORTCUTS } from '@/shared/config/shortcuts'
import {
  ListBulletsIcon,
  ListNumbersIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from '@/shared/ui/icons'
import { Toolbar } from '@/shared/ui/molecules/toolbar'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'
import { Textarea } from '@/shared/ui/shadcn/textarea'

import { Composer } from './index'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const CONTROL_LABELS = { minimize: 'Minimizar', expand: 'Expandir', close: 'Cerrar', drag: 'Mover' }

const FORMAT_TOOLS = [
  { value: 'bold', label: 'Negrita', keys: SHORTCUTS.bold, icon: TextBIcon },
  { value: 'italic', label: 'Cursiva', keys: SHORTCUTS.italic, icon: TextItalicIcon },
  { value: 'underline', label: 'Subrayado', keys: SHORTCUTS.underline, icon: TextUnderlineIcon },
] as const

const meta = {
  title: 'Organisms/Composer',
  component: Composer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Composer>

export default meta
type Story = StoryObj<typeof meta>

export const EmailComposer: Story = {
  args: { label: 'Redactar correo', children: null, onClose: fn() },
  render: (args) => (
    <div className="h-svh bg-muted/30">
      <Composer {...args}>
        <Composer.Header dragLabel={CONTROL_LABELS.drag}>
          <Composer.Title>Nuevo correo</Composer.Title>
          <Composer.Controls labels={CONTROL_LABELS} />
        </Composer.Header>
        <Composer.Field
          label="Para"
          end={
            <>
              <Button variant="ghost" size="xs">
                Cc
              </Button>
              <Button variant="ghost" size="xs">
                Cco
              </Button>
            </>
          }
        >
          <Input
            placeholder="sandra@neptuno.com"
            className="h-8 border-none px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </Composer.Field>
        <Composer.Field label="Asunto">
          <Input
            placeholder="Escribe un asunto…"
            className="h-8 border-none px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </Composer.Field>
        <Composer.Body>
          <Textarea
            placeholder="Tu mensaje…"
            className="min-h-40 resize-none border-none px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </Composer.Body>
        <Composer.Attachments>
          <Composer.Attachment name="propuesta.pdf" size={182_400} removeLabel="Quitar adjunto" />
          <Composer.Attachment name="logo.png" size={24_576} removeLabel="Quitar adjunto" />
        </Composer.Attachments>
        <Composer.Footer>
          <Toolbar aria-label="Formato" className="border-none bg-transparent p-0 shadow-none">
            <Toolbar.ToggleGroup type="multiple" aria-label="Formato de texto">
              {FORMAT_TOOLS.map(({ value, label, keys, icon: Icon }) => (
                <Toolbar.ToggleItem
                  key={value}
                  value={value}
                  size="icon-sm"
                  aria-label={label}
                  hint={{ label, keys }}
                >
                  <Icon />
                </Toolbar.ToggleItem>
              ))}
            </Toolbar.ToggleGroup>
            <Toolbar.Separator />
            <Toolbar.Button size="icon-sm" aria-label="Lista" hint={{ label: 'Lista' }}>
              <ListBulletsIcon />
            </Toolbar.Button>
            <Toolbar.Button
              size="icon-sm"
              aria-label="Lista numerada"
              hint={{ label: 'Lista numerada' }}
            >
              <ListNumbersIcon />
            </Toolbar.Button>
          </Toolbar>
          <Composer.FooterEnd>
            <Button size="sm">Enviar</Button>
          </Composer.FooterEnd>
        </Composer.Footer>
      </Composer>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Minimizar' }))
    await expect(canvas.getByPlaceholderText('Tu mensaje…')).not.toBeVisible()
    await userEvent.click(canvas.getByText('Nuevo correo'))
    await expect(canvas.getByPlaceholderText('Tu mensaje…')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Cerrar' }))
    await expect(args.onClose).toHaveBeenCalledOnce()
  },
}

export const NoteComposer: Story = {
  args: { label: 'Nueva nota', children: null },
  render: (args) => (
    <div className="h-svh bg-muted/30">
      <Composer {...args}>
        <Composer.Header dragLabel={CONTROL_LABELS.drag}>
          <Composer.Title>Nota</Composer.Title>
          <Composer.Controls labels={CONTROL_LABELS} />
        </Composer.Header>
        <Composer.Body>
          <Textarea
            placeholder="Escribe una nota…"
            className="min-h-30 resize-none border-none px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </Composer.Body>
        <Composer.Footer>
          <Composer.FooterEnd>
            <Button size="sm" variant="secondary">
              Guardar nota
            </Button>
          </Composer.FooterEnd>
        </Composer.Footer>
      </Composer>
    </div>
  ),
}
