import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { ActivityTypeDef } from '@repo/shared-types'

import {
  ActivityCatalogContext,
  useActivityCatalog,
} from '@/entities/activity/model/activity-catalog-context'

const CATALOG: ActivityTypeDef[] = [
  {
    key: 'call',
    label: 'Llamada',
    icon: 'phone',
    color: '#22C55E',
    trackDuration: true,
    isSystem: true,
  },
]

function Probe() {
  const catalog = useActivityCatalog()
  return <span>{catalog.length === 0 ? 'vacio' : catalog.map((t) => t.label).join(',')}</span>
}

describe('useActivityCatalog', () => {
  it('reads what the provider published', () => {
    render(
      <ActivityCatalogContext.Provider value={CATALOG}>
        <Probe />
      </ActivityCatalogContext.Provider>,
    )

    expect(screen.getByText('Llamada')).toBeInTheDocument()
  })

  it('renders without a provider instead of throwing', () => {
    render(<Probe />)

    expect(screen.getByText('vacio')).toBeInTheDocument()
  })
})
