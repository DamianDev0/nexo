import type { TFunction } from 'i18next'

interface HintSource {
  readonly description?: string
  readonly counts: Record<string, number | undefined>
  readonly withoutEmail: number
  readonly entityTerms?: { entity: string; entities: string }
}

export function buildContactHints(t: TFunction, source: HintSource): string[] {
  const hints: string[] = []
  const { description, counts, withoutEmail, entityTerms } = source
  const terms = { entity: entityTerms?.entity ?? '', entities: entityTerms?.entities ?? '' }

  if (description) hints.push(description)

  const pending = counts.new ?? 0
  if (pending > 0) hints.push(t('contacts.hints.pending', { count: pending, ...terms }))

  const clients = counts.client ?? 0
  if (clients > 0) hints.push(t('contacts.hints.clients', { count: clients, ...terms }))

  if (withoutEmail > 0)
    hints.push(t('contacts.hints.withoutEmail', { count: withoutEmail, ...terms }))

  const total = counts.all ?? 0
  if (total > 0) hints.push(t('contacts.hints.total', { count: total, ...terms }))

  return hints
}
