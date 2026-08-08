import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { loadBaseline, readLines, relPath, report, walkSource } from './lib.mjs'

const CLASS_ATTR = /className=["'{`]+([^"'`}]{50,})["'`}]/
const MIN_CLASSES = 5
const SHARED_UTILS_SRC = new URL('../../../packages/shared-utils/src', import.meta.url).pathname
const SHARED_LIB = new URL('../src/shared/lib', import.meta.url).pathname
const EXPORT_NAME = /export\s+(?:function|const)\s+([a-zA-Z$][\w$]{7,})/g
const LOCAL_DECLARATION = /^\s*(?:function|const)\s+([a-zA-Z$][\w$]{7,})\s*[=(]/

function collectSharedExports() {
  const names = new Set()
  for (const dir of [SHARED_UTILS_SRC, SHARED_LIB]) {
    const stack = [dir]
    while (stack.length > 0) {
      const current = stack.pop()
      let entries
      try {
        entries = readdirSync(current, { withFileTypes: true })
      } catch {
        continue
      }
      for (const entry of entries) {
        const full = join(current, entry.name)
        if (entry.isDirectory()) stack.push(full)
        else if (/\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
          const source = readFileSync(full, 'utf8')
          for (const match of source.matchAll(EXPORT_NAME)) names.add(match[1])
        }
      }
    }
  }
  return names
}

const sharedExports = collectSharedExports()
const classOwners = new Map()
const violations = []

for (const file of walkSource()) {
  const rel = relPath(file)
  const inShared = rel.startsWith('src/shared/')
  const lines = readLines(file)

  lines.forEach((line, index) => {
    if (!inShared) {
      const classMatch = CLASS_ATTR.exec(line)
      if (classMatch && classMatch[1].trim().split(/\s+/).length >= MIN_CLASSES) {
        const value = classMatch[1].trim()
        const owner = classOwners.get(value)
        if (owner && owner.rel !== rel) {
          violations.push({
            key: `${rel}:${index + 1} :: className repeated from ${owner.rel}:${owner.line}`,
            detail: 'same long className in two slices — extract a shared/ui component',
          })
        } else if (!owner) {
          classOwners.set(value, { rel, line: index + 1 })
        }
      }
    }

    if (!inShared) {
      const local = LOCAL_DECLARATION.exec(line)
      if (local && sharedExports.has(local[1])) {
        violations.push({
          key: `${rel}:${index + 1} :: local ${local[1]}`,
          detail: `"${local[1]}" already exists in shared — import it instead of redeclaring`,
        })
      }
    }
  })
}

report('check-shared-duplication', violations, loadBaseline('check-shared-duplication'))
