import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactFormValues } from '@/features/create-contact/lib/contact-form.schema'

import { CONTACT_FORM_DEFAULTS } from '@/features/create-contact/config/contact-form.constants'
import { ContactTypeFields } from '@/features/create-contact/ui/ContactTypeFields'

const CHOICES: ReadonlyArray<TaxonomyChoice> = [
  { key: 'customer', label: 'Cliente', color: '#3B82F6' },
  { key: 'other', label: 'Otro', color: '#6B7280' },
]

function Harness({ type }: Readonly<{ type: string }>) {
  const form = useForm<ContactFormValues>({
    defaultValues: { ...CONTACT_FORM_DEFAULTS, type },
  })
  return <ContactTypeFields control={form.control} choices={CHOICES} />
}

describe('ContactTypeFields', () => {
  it('renders the type select with its label', () => {
    render(<Harness type="" />)

    expect(screen.getByText('contacts.form.type')).toBeVisible()
  })

  it('hides the free-text field while the type is not other', () => {
    render(<Harness type="customer" />)

    expect(screen.queryByText('contacts.form.typeOtherLabel')).not.toBeInTheDocument()
  })

  it('shows the required free-text field when the type is other', () => {
    render(<Harness type="other" />)

    expect(screen.getByText('contacts.form.typeOtherLabel')).toBeVisible()
    expect(screen.getByPlaceholderText('contacts.form.typeOtherPlaceholder')).toBeVisible()
  })
})
