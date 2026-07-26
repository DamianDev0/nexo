import { useCallback } from 'react'

import { useSetupWizard } from '../../model/wizard-context'
import { StepDone } from '../StepDone'

export function DoneStep() {
  const { wizard } = useSetupWizard()
  const handleReview = useCallback(() => wizard.goToStep(1), [wizard])

  return <StepDone onGoToDashboard={wizard.completeOnboarding} onReviewConfig={handleReview} />
}
