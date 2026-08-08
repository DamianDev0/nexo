import { readdirSync } from 'node:fs'
import { basename } from 'node:path'

import { loadBaseline, relPath, report, walkSource } from './lib.mjs'

const TESTABLE = /^src\/(features|entities)\/[^/]+\/(lib|model)\//
const EXEMPT = /\/model\/types\/|\/index\.tsx?$|-context\.tsx$|\.d\.ts$/

function collectTestNames() {
  const names = new Set()
  const stack = [new URL('../tests', import.meta.url).pathname]
  while (stack.length > 0) {
    const current = stack.pop()
    let entries
    try {
      entries = readdirSync(current, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      if (entry.isDirectory()) stack.push(`${current}/${entry.name}`)
      else {
        const match = /^(.+)\.test\.(ts|tsx)$/.exec(entry.name)
        if (match) names.add(match[1])
      }
    }
  }
  return names
}

const testNames = collectTestNames()
const violations = []

for (const file of walkSource()) {
  const rel = relPath(file)
  if (!TESTABLE.test(rel) || EXEMPT.test(rel)) continue
  const name = basename(rel).replace(/\.(ts|tsx)$/, '')
  if (!testNames.has(name)) {
    violations.push({
      key: `${rel}`,
      detail: `no ${name}.test.* under tests/ — new logic ships with tests`,
    })
  }
}

report('check-test-mirror', violations, loadBaseline('check-test-mirror'))
