'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { expandCollapse, quickEase, useReducedTransition } from '@/shared/lib/animations'
import { ControlledField } from '@/shared/ui/molecules/controlled-field'

import { CONTACT_TYPE_OTHER_KEY } from '../config/contact-type.constants'

import { TaxonomySelectField } from './TaxonomySelectField'

import type { ContactFormValues } from '../lib/contact-form.schema'
import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { Control } from 'react-hook-form'

type ContactTypeFieldsProps = {
  readonly control: Control<ContactFormValues>
  readonly choices: ReadonlyArray<TaxonomyChoice>
}

export function ContactTypeFields({ control, choices }: Readonly<ContactTypeFieldsProps>) {
  const terms = useEntityTerms('contact')
  const { t } = useTranslation()
  const transition = useReducedTransition(quickEase)
  const type = useWatch({ control, name: 'type' })

  return (
    <>
      <TaxonomySelectField
        control={control}
        name="type"
        label={t('contacts.form.type')}
        placeholder={t('contacts.form.typePlaceholder', { entity: terms.lowerSingular })}
        choices={choices}
      />
      <AnimatePresence initial={false}>
        {type === CONTACT_TYPE_OTHER_KEY && (
          <motion.div
            variants={expandCollapse}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="overflow-hidden"
          >
            <ControlledField
              control={control}
              name="typeLabel"
              field={{
                label: t('contacts.form.typeOtherLabel'),
                placeholder: t('contacts.form.typeOtherPlaceholder', {
                  entity: terms.lowerSingular,
                }),
                required: true,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
