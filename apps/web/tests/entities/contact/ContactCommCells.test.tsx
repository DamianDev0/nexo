import { DocumentType } from '@repo/shared-types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import {
  ContactDocumentCell,
  ContactEmailCell,
  ContactPhoneCell,
  ContactWhatsAppCell,
} from '@/entities/contact/ui/cells/ContactCommCells'

const LABELS = { copy: 'Copiar', action: 'Acción' }
const DOC_LABELS = { copy: 'Copiar', invalid: 'Documento inválido' }

describe('ContactPhoneCell', () => {
  it('falls back to a dash without any number', () => {
    render(<ContactPhoneCell value={null} whatsapp={null} labels={LABELS} />, { wrapper })

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('formats the number and links the call action', () => {
    render(<ContactPhoneCell value="3001234567" whatsapp={null} labels={LABELS} />, { wrapper })

    expect(screen.getByText('+57 300 123 4567')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Acción' })).toHaveAttribute(
      'href',
      'tel:+573001234567',
    )
  })

  it('falls back to the whatsapp number when phone is missing', () => {
    render(<ContactPhoneCell value={null} whatsapp="3109998877" labels={LABELS} />, { wrapper })

    expect(screen.getByText('+57 310 999 8877')).toBeInTheDocument()
  })

  it('copies the formatted number', async () => {
    const onCopy = vi.fn()
    render(
      <ContactPhoneCell value="3001234567" whatsapp={null} labels={LABELS} onCopy={onCopy} />,
      { wrapper },
    )

    await userEvent.click(screen.getByRole('button', { name: 'Copiar' }))

    expect(onCopy).toHaveBeenCalledWith('+57 300 123 4567')
  })
})

describe('ContactWhatsAppCell', () => {
  it('links the conversation on wa.me in a new tab', () => {
    render(<ContactWhatsAppCell value="3100050717" labels={LABELS} />, { wrapper })

    const link = screen.getByRole('link', { name: 'Acción' })
    expect(link).toHaveAttribute('href', 'https://wa.me/573100050717')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('hides the conversation action when the contact opted out', () => {
    render(
      <ContactWhatsAppCell
        value="3100050717"
        labels={{ ...LABELS, blocked: 'No contactar' }}
        blocked
      />,
      { wrapper },
    )

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeInTheDocument()
  })
})

describe('ContactEmailCell', () => {
  it('links the composer and copies the raw address', async () => {
    const onCopy = vi.fn()
    render(<ContactEmailCell value="ana@empresa.co" labels={LABELS} onCopy={onCopy} />, {
      wrapper,
    })

    expect(screen.getByRole('link', { name: 'Acción' })).toHaveAttribute(
      'href',
      'mailto:ana@empresa.co',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Copiar' }))
    expect(onCopy).toHaveBeenCalledWith('ana@empresa.co')
  })
})

describe('ContactDocumentCell', () => {
  it('prefixes the document type and copies the raw number', async () => {
    const onCopy = vi.fn()
    render(
      <ContactDocumentCell
        value="1000324679"
        docType={DocumentType.CC}
        labels={DOC_LABELS}
        onCopy={onCopy}
      />,
      { wrapper },
    )

    expect(screen.getByText('CC 1000324679')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Copiar' }))
    expect(onCopy).toHaveBeenCalledWith('1000324679')
  })

  it('flags a number that breaks the document type rules', () => {
    render(<ContactDocumentCell value="ABC" docType={DocumentType.CC} labels={DOC_LABELS} />, {
      wrapper,
    })

    expect(screen.getByRole('img', { name: 'Documento inválido' })).toBeInTheDocument()
  })
})
