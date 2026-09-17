'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CaretLeftIcon } from '@/shared/ui/icons'
import AnimatedStepper from '@/shared/ui/smoothui/animated-stepper'

import { IMPORT_SHELL_CLASS } from '../config/import.constants'
import { buildStepDefs, stepIndex } from '../lib/import-steps'
import { useImportDescriptor } from '../model/useImportDescriptor'
import { useRecordImport } from '../model/useRecordImport'

import { ConfigureStep } from './steps/ConfigureStep'
import { DoneStep } from './steps/DoneStep'
import { MapStep } from './steps/MapStep'
import { ReviewStep } from './steps/ReviewStep'
import { UploadStep } from './steps/UploadStep'

export function ImportWizard() {
  const { t } = useTranslation()
  const { terms, descriptor } = useImportDescriptor()
  const entities = terms.plural
  const router = useRouter()
  const backToList = useCallback(
    () => router.push(descriptor.routes.list),
    [router, descriptor.routes.list],
  )
  const { state, actions } = useRecordImport(backToList)
  const steps = useMemo(() => buildStepDefs(t), [t])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className={`${IMPORT_SHELL_CLASS} shrink-0 pb-6 pt-8`}>
        <div className="flex items-center gap-3">
          <PillButton
            variant="ghost"
            size="xs"
            className="w-8 px-0"
            aria-label={t('imports.actions.backToList', { entities })}
            onClick={backToList}
          >
            <CaretLeftIcon className="size-4" />
          </PillButton>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {t('imports.title', { entities })}
            </h1>
            <Text as="p" variant="muted">
              {t(`imports.steps.${state.step}`, { entities })}
            </Text>
          </div>
        </div>

        <div className="pt-6">
          <AnimatedStepper steps={steps} currentStep={stepIndex(state.step)} />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className={`${IMPORT_SHELL_CLASS} pb-8`}>
          {state.step === 'upload' && (
            <UploadStep onFile={actions.onFile} isBusy={state.isAnalyzing} />
          )}

          {state.step === 'configure' && state.analysis && (
            <ConfigureStep
              analysis={state.analysis}
              strategy={state.strategy}
              onStrategy={actions.onStrategy}
              onRestart={actions.onRestart}
            />
          )}

          {state.step === 'map' && state.analysis && (
            <MapStep analysis={state.analysis} data={state.mapState} onRemap={actions.onRemap} />
          )}

          {state.step === 'review' && state.report && (
            <ReviewStep report={state.report} strategy={state.strategy} />
          )}

          {state.step === 'done' && state.result && (
            <DoneStep result={state.result} report={state.report} />
          )}
        </div>
      </div>

      <footer className="shrink-0 border-t border-border bg-card">
        <div className={`${IMPORT_SHELL_CLASS} flex items-center justify-end gap-2 py-4`}>
          {state.step === 'configure' && (
            <>
              <PillButton variant="ghost" size="md" onClick={actions.onRestart}>
                {t('imports.actions.changeFile')}
              </PillButton>
              <PillButton size="md" onClick={() => actions.onGoTo('map')}>
                {t('imports.actions.continue')}
              </PillButton>
            </>
          )}

          {state.step === 'map' && (
            <>
              <PillButton variant="ghost" size="md" onClick={() => actions.onGoTo('configure')}>
                {t('imports.actions.back')}
              </PillButton>
              <PillButton
                size="md"
                disabled={!state.canContinueFromMap || state.isValidating}
                onClick={() => actions.onGoTo('review')}
              >
                {state.isValidating ? t('imports.actions.checking') : t('imports.actions.continue')}
              </PillButton>
            </>
          )}

          {state.step === 'review' && state.report && (
            <>
              <PillButton variant="ghost" size="md" onClick={() => actions.onGoTo('map')}>
                {t('imports.actions.back')}
              </PillButton>
              <PillButton
                size="md"
                disabled={state.report.readyRows === 0 || state.isImporting}
                onClick={actions.onImport}
              >
                {state.isImporting
                  ? t('imports.actions.importing')
                  : t('imports.actions.importCount', {
                      count: state.report.readyRows,
                      entities,
                    })}
              </PillButton>
            </>
          )}

          {state.step === 'done' && (
            <PillButton size="md" onClick={actions.onFinish}>
              {t('imports.actions.viewList', { entities })}
            </PillButton>
          )}
        </div>
      </footer>
    </div>
  )
}
