import { describe, expect, it } from 'vitest'

import {
  CLOSED_PANEL,
  PANEL_PARAM,
  panelQueryString,
  parsePanelParam,
  toPanelId,
} from '@/views/contact-detail/lib/panel-route'

describe('parsePanelParam', () => {
  it('opens the default panel when the url says nothing', () => {
    expect(parsePanelParam(null)).toBe('notes')
    expect(parsePanelParam('inbox')).toBe('notes')
  })

  it('honours a panel named in the url', () => {
    expect(parsePanelParam('tasks')).toBe('tasks')
    expect(parsePanelParam('meetings')).toBe('meetings')
  })

  it('keeps the panel closed when the url asked for it', () => {
    expect(parsePanelParam(CLOSED_PANEL)).toBeNull()
  })
})

describe('toPanelId', () => {
  it('only accepts real panels', () => {
    expect(toPanelId('tasks')).toBe('tasks')
    expect(toPanelId(null)).toBeNull()
    expect(toPanelId('nope')).toBeNull()
  })
})

describe('panelQueryString', () => {
  it('leaves the url clean for the default panel', () => {
    expect(panelQueryString(new URLSearchParams(), 'notes')).toBe('')
  })

  it('names any other panel', () => {
    expect(panelQueryString(new URLSearchParams(), 'meetings')).toBe(`?${PANEL_PARAM}=meetings`)
  })

  it('records a closed panel so a reload keeps it closed', () => {
    expect(panelQueryString(new URLSearchParams(), null)).toBe(`?${PANEL_PARAM}=${CLOSED_PANEL}`)
  })

  it('preserves the rest of the query', () => {
    const params = new URLSearchParams({ tab: 'activity', panel: 'tasks' })
    expect(panelQueryString(params, 'notes')).toBe('?tab=activity')
    expect(panelQueryString(params, 'meetings')).toBe('?tab=activity&panel=meetings')
  })
})
