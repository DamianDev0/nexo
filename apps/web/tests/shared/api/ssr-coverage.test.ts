import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { globSync } from 'tinyglobby'
import { describe, expect, it } from 'vitest'

const SRC = join(process.cwd(), 'src')

const QUERY_KEY_RE = /queryKey:\s*QUERY_KEYS\.([\w.]+?)(?:\(|,|\s|$)/g
const PREFETCH_RE = /QUERY_KEYS\.([\w.]+?)(?:\(|,|\s|\))/g

const CACHE_MUTATORS = /invalidateQueries|removeQueries|cancelQueries|refetchQueries|setQueryData/

function read(patterns: string[]): string {
  return globSync(patterns, { cwd: SRC, absolute: true })
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n')
}

function keysIn(source: string, pattern: RegExp, skipCacheMutators = false): Set<string> {
  const found = new Set<string>()
  for (const line of source.split('\n')) {
    if (skipCacheMutators && CACHE_MUTATORS.test(line)) continue
    for (const match of line.matchAll(pattern)) {
      if (match[1]) found.add(match[1])
    }
  }
  return found
}

describe('SSR coverage', () => {
  it('prefetches every query key the client subscribes to', () => {
    const consumed = keysIn(read(['**/*.ts', '**/*.tsx']), QUERY_KEY_RE, true)
    const prefetched = keysIn(
      read(['app/**/*.tsx', 'shared/api/prefetch-*.ts', '**/query/prefetch-*.ts']),
      PREFETCH_RE,
    )

    const missing = [...consumed].filter((key) => !prefetched.has(key))

    expect(missing).toEqual([])
  })

  it('routes never import the browser axios client', () => {
    const routes = globSync(['app/**/page.tsx', 'app/**/layout.tsx'], { cwd: SRC, absolute: true })

    const offenders = routes.filter((file) => {
      const source = readFileSync(file, 'utf8')
      return source.includes('shared/api/services/') || source.includes("'use client'")
    })

    expect(offenders).toEqual([])
  })
})
