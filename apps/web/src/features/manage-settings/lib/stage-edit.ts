import type { PipelineStageInput } from '@/shared/api/services/settings.service'
import type { PipelineStage } from '@repo/shared-types'

export type StageDraft = {
  id: string
  name: string
  color: string
  probability: number
}

export function toStageDrafts(stages: ReadonlyArray<PipelineStage>): StageDraft[] {
  return [...stages]
    .sort((a, b) => a.position - b.position)
    .map(({ id, name, color, probability }) => ({ id, name, color, probability }))
}

export function updateStageDraft(
  drafts: ReadonlyArray<StageDraft>,
  id: string,
  patch: Partial<Omit<StageDraft, 'id'>>,
): StageDraft[] {
  return drafts.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft))
}

export function removeStageDraft(drafts: ReadonlyArray<StageDraft>, id: string): StageDraft[] {
  return drafts.filter((draft) => draft.id !== id)
}

export function moveStageDraft(
  drafts: ReadonlyArray<StageDraft>,
  id: string,
  direction: -1 | 1,
): StageDraft[] {
  const from = drafts.findIndex((draft) => draft.id === id)
  const to = from + direction
  if (from === -1 || to < 0 || to >= drafts.length) return [...drafts]

  const next = [...drafts]
  const [moved] = next.splice(from, 1)
  if (!moved) return [...drafts]
  next.splice(to, 0, moved)
  return next
}

export function stageDraftsEqual(
  a: ReadonlyArray<StageDraft>,
  b: ReadonlyArray<StageDraft>,
): boolean {
  if (a.length !== b.length) return false
  return a.every((draft, index) => {
    const other = b[index]
    return (
      other !== undefined &&
      draft.id === other.id &&
      draft.name === other.name &&
      draft.color === other.color &&
      draft.probability === other.probability
    )
  })
}

export function stageDraftsValid(drafts: ReadonlyArray<StageDraft>): boolean {
  return (
    drafts.length > 0 &&
    drafts.every(
      (draft) =>
        draft.name.trim().length > 0 &&
        Number.isInteger(draft.probability) &&
        draft.probability >= 0 &&
        draft.probability <= 100,
    )
  )
}

export function toStageInputs(drafts: ReadonlyArray<StageDraft>): PipelineStageInput[] {
  return drafts.map((draft, index) => ({
    name: draft.name.trim(),
    color: draft.color,
    probability: draft.probability,
    position: index,
  }))
}

export function clampProbability(raw: string): number {
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) return 0
  return Math.min(100, Math.max(0, parsed))
}

export function defaultStageInputs(
  names: ReadonlyArray<string>,
  colors: ReadonlyArray<string>,
): PipelineStageInput[] {
  return names.map((name, index) => ({
    name,
    color: colors[index % colors.length] ?? '',
    probability: Math.round(((index + 1) / names.length) * 100),
    position: index,
  }))
}
