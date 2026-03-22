import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sileo } from 'sileo'
import settingsService from '@/core/services/settings.service'

interface Stage {
  name: string
  color: string
  probability: number
}

const DEFAULT_STAGES: Stage[] = [
  { name: 'MQL', color: '#6366F1', probability: 10 },
  { name: 'SQL', color: '#8B5CF6', probability: 25 },
  { name: 'Demo Scheduled', color: '#F59E0B', probability: 40 },
  { name: 'Proposal', color: '#F97316', probability: 60 },
  { name: 'Negotiation', color: '#EF4444', probability: 80 },
  { name: 'Closed Won', color: '#059669', probability: 100 },
]

export function useStepPipeline(onNext: () => void) {
  const [pipelineName, setPipelineName] = useState('Sales Pipeline')
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES)

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      settingsService.createPipeline({
        name: pipelineName,
        isDefault: true,
        stages: stages.map((s) => ({ name: s.name, color: s.color, probability: s.probability })),
      }),
    onSuccess: () => onNext(),
    onError: (err) => sileo.error({ title: 'Failed to create pipeline', description: err.message }),
  })

  const handleAddStage = useCallback(() => {
    setStages((prev) => [...prev, { name: 'New Stage', color: '#6B7280', probability: 50 }])
  }, [])

  const handleRemoveStage = useCallback((index: number) => {
    setStages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpdateStage = useCallback(
    (index: number, field: keyof Stage, value: string | number) => {
      setStages((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
    },
    [],
  )

  const handleSave = useCallback(() => save(), [save])

  return {
    pipelineName,
    setPipelineName,
    stages,
    handleAddStage,
    handleRemoveStage,
    handleUpdateStage,
    handleSave,
    isPending,
  }
}
