import { loadBaseline, readLines, relPath, report, walkSource } from './lib.mjs'

const FORBIDDEN_IMPORTS = [
  { pattern: /@tanstack\/react-query/, reason: 'data fetching belongs in query/ hooks' },
  { pattern: /@\/shared\/api\/services/, reason: 'API services belong in query/ hooks' },
  { pattern: /@\/shared\/api\/dal/, reason: 'DAL is server-only, never in ui/' },
  { pattern: /['"]zustand['"]/, reason: 'stores belong in model/, ui/ receives props' },
  { pattern: /['"]axios['"]/, reason: 'HTTP goes through shared/api request<T>' },
  {
    pattern: /from\s+['"]\.{1,2}\/(?:\.\.\/)*query\//,
    reason: 'query hooks are wired by containers or model/, not dumb ui/',
  },
]

const UI_SEGMENT = /src\/(features|entities|widgets|views)\/[^/]+\/ui\//
const SHARED_UI = /src\/shared\/ui\//
const CONTAINERS = /\/ui\/containers\//

const violations = []
for (const file of walkSource()) {
  const rel = relPath(file)
  if (!(UI_SEGMENT.test(rel) || SHARED_UI.test(rel)) || CONTAINERS.test(rel)) continue
  readLines(file).forEach((line, index) => {
    if (!/^\s*import\b|require\(/.test(line)) return
    for (const rule of FORBIDDEN_IMPORTS) {
      if (rule.pattern.test(line)) {
        violations.push({
          key: `${rel}:${index + 1} :: ${line.trim().slice(0, 90)}`,
          detail: rule.reason,
        })
      }
    }
  })
}

report('check-ui-purity', violations, loadBaseline('check-ui-purity'))
