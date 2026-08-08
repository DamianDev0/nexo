import { loadBaseline, readLines, relPath, report, walkSource } from './lib.mjs'

const SLICE_LIB_CONFIG = /^src\/(features|entities|widgets|views)\/[^/]+\/(lib|config)\//
const SLICE_MODEL = /^src\/(features|entities|widgets|views)\/[^/]+\/model\//
const ANY_QUERY = /^src\/(features|entities|widgets|views|shared)\/[^/]*\/?query\//
const REACT_IMPORT = /^\s*import\s+(?!type\b)[^;]*from\s+['"]react(-dom)?['"]/
const HOOK_DECLARATION = /^\s*(?:export\s+)?(?:function\s+use[A-Z]|const\s+use[A-Z]\w*\s*=)/
const UPPER_CONST = /^export const [A-Z][A-Z0-9_]{2,}\s*[:=]/

const violations = []
for (const file of walkSource()) {
  const rel = relPath(file)
  const lines = readLines(file)

  if (SLICE_LIB_CONFIG.test(rel)) {
    lines.forEach((line, index) => {
      if (REACT_IMPORT.test(line)) {
        violations.push({
          key: `${rel}:${index + 1} :: ${line.trim().slice(0, 80)}`,
          detail: 'lib/ and config/ are pure — no runtime react imports (import type is fine)',
        })
      }
      if (HOOK_DECLARATION.test(line)) {
        violations.push({
          key: `${rel}:${index + 1} :: ${line.trim().slice(0, 80)}`,
          detail: 'hooks live in model/ or query/, never lib/ or config/',
        })
      }
      if (/^\s*['"]use client['"]/.test(line)) {
        violations.push({
          key: `${rel}:${index + 1} :: 'use client'`,
          detail: "pure segments never need 'use client'",
        })
      }
    })
  }

  if (SLICE_MODEL.test(rel) && !rel.includes('/model/types/')) {
    lines.forEach((line, index) => {
      if (UPPER_CONST.test(line)) {
        violations.push({
          key: `${rel}:${index + 1} :: ${line.trim().slice(0, 80)}`,
          detail: 'UPPER_SNAKE constants belong in config/, not model/',
        })
      }
    })
  }

  if (ANY_QUERY.test(rel) && rel.endsWith('.tsx')) {
    violations.push({
      key: `${rel} :: .tsx in query/`,
      detail: 'query/ holds hooks and prefetchers — UI never lives here',
    })
  }
}

report('check-segment-purity', violations, loadBaseline('check-segment-purity'))
