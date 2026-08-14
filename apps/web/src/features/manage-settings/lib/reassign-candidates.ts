import type { ReassignCandidate } from '../model/types'
import type { Tag, TaxonomyOption } from '@repo/shared-types'

export function tagCandidates(tags: ReadonlyArray<Tag>, excludeId: string): ReassignCandidate[] {
  return tags
    .filter((tag) => tag.id !== excludeId)
    .map((tag) => ({ key: tag.name, label: tag.name, color: tag.color }))
}

export function optionCandidates(
  options: ReadonlyArray<TaxonomyOption>,
  excludeKey: string,
  label: (option: TaxonomyOption) => string,
): ReassignCandidate[] {
  return options
    .filter((option) => option.key !== excludeKey)
    .map((option) => ({ key: option.key, label: label(option), color: option.color }))
}
