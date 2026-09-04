import { normalizeText } from '@repo/shared-utils'

import { TEMPLATE_HEADERS, TEMPLATE_SAMPLE } from '../config/import-template.constants'

export function buildCsvTemplate(): string {
  return `${TEMPLATE_HEADERS.join(',')}\n${TEMPLATE_SAMPLE.join(',')}\n`
}

export function templateEntitiesSlug(entities: string): string {
  const slug = normalizeText(entities).replaceAll(/[^a-z0-9]+/g, '-')
  return slug.replaceAll(/^-|-$/g, '')
}
