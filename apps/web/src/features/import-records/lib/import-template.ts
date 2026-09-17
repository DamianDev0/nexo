import { normalizeText } from '@repo/shared-utils'

import type { ObjectImportConfig } from '@/entities/object-descriptor'

export function buildCsvTemplate(template: ObjectImportConfig['template']): string {
  return `${template.headers.join(',')}\n${template.sample.join(',')}\n`
}

export function templateEntitiesSlug(entities: string): string {
  const slug = normalizeText(entities).replaceAll(/[^a-z0-9]+/g, '-')
  return slug.replaceAll(/^-|-$/g, '')
}
