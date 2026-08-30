import type { ActivityTypePatch } from '../../lib/activity-type-edit'
import type { StageDraft } from '../../lib/stage-edit'
import type { PipelineStageInput } from '@/shared/api/services/settings.service'

export interface ActivityTypeRowActions {
  readonly onPatch: (key: string, patch: ActivityTypePatch) => void
  readonly onRemove: (key: string) => void
}

export type StageSaveHandler = (stages: PipelineStageInput[]) => void

export interface PipelineCardActions {
  readonly onRename: (id: string, name: string) => void
  readonly onSetDefault: (id: string) => void
  readonly onRequestRemove: (id: string) => void
  readonly onToggleExpand: (id: string) => void
  readonly onSaveStages: (id: string, stages: PipelineStageInput[]) => void
}

export interface StageRowState {
  readonly first: boolean
  readonly last: boolean
}

export interface StageEditorRowActions {
  readonly onUpdate: (id: string, patch: Partial<Omit<StageDraft, 'id'>>) => void
  readonly onRemove: (id: string) => void
  readonly onMove: (id: string, direction: -1 | 1) => void
}
