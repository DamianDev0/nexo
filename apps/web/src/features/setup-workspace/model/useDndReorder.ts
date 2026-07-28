import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useCallback, useState } from 'react'

export function useDndReorder(onReorder: (activeId: string, overId: string) => void) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      if (over && active.id !== over.id) {
        onReorder(String(active.id), String(over.id))
      }
    },
    [onReorder],
  )

  const handleDragCancel = useCallback(() => setActiveId(null), [])

  return { sensors, activeId, handleDragStart, handleDragEnd, handleDragCancel }
}
