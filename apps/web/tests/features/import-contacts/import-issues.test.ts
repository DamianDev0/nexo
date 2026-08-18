import { describe, expect, it } from 'vitest'

import type { ImportIssue } from '@repo/shared-types'

import { filterIssues, issueReportCsv } from '@/features/import-contacts/lib/import-issues'

const ISSUES: ImportIssue[] = [
  { row: 2, severity: 'error', field: 'firstName', message: 'First name is required', value: null },
  { row: 3, severity: 'warning', field: 'tags', message: 'Tags ignored', value: 'fantasma' },
  { row: 4, severity: 'error', field: 'email', message: 'Invalid email', value: 'ana@' },
]

describe('filterIssues', () => {
  it('returns everything under the all filter', () => {
    expect(filterIssues(ISSUES, 'all')).toHaveLength(3)
  })

  it('narrows to the severity the user picked', () => {
    expect(filterIssues(ISSUES, 'errors').map((issue) => issue.row)).toEqual([2, 4])
    expect(filterIssues(ISSUES, 'warnings').map((issue) => issue.row)).toEqual([3])
  })

  it('never mutates the list it was given', () => {
    const copy = [...ISSUES]
    filterIssues(ISSUES, 'errors')

    expect(ISSUES).toEqual(copy)
  })
})

describe('issueReportCsv', () => {
  it('writes a header plus one line per issue so the user can fix the source file', () => {
    const lines = issueReportCsv(ISSUES).split('\n')

    expect(lines[0]).toBe('row,severity,field,message,value')
    expect(lines).toHaveLength(4)
    expect(lines[1]).toBe('"2","error","firstName","First name is required",""')
  })

  it('escapes quotes so a stray quote cannot break the report', () => {
    const csv = issueReportCsv([
      { row: 9, severity: 'error', field: null, message: 'Bad "value"', value: null },
    ])

    expect(csv).toContain('"Bad ""value"""')
  })
})
