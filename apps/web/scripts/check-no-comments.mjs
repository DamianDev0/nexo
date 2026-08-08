import { loadBaseline, readLines, relPath, report, walkSource } from './lib.mjs'

const PRAGMA =
  /eslint-(disable|enable)|@ts-(expect-error|ignore|nocheck)|prettier-ignore|biome-ignore|@vitest-environment|c8 ignore|type=/

function stripStrings(line) {
  return line
    .replaceAll(/'(?:[^'\\]|\\.)*'/g, "''")
    .replaceAll(/"(?:[^"\\]|\\.)*"/g, '""')
    .replaceAll(/`[^`]*`/g, '``')
}

const violations = []
for (const file of walkSource()) {
  const rel = relPath(file)
  let inBlock = false
  readLines(file).forEach((line, index) => {
    if (inBlock) {
      if (line.includes('*/')) inBlock = false
      return
    }
    const stripped = stripStrings(line)
    const single = stripped.indexOf('//')
    const block = stripped.indexOf('/*')
    if (single === -1 && block === -1) return
    if (PRAGMA.test(line)) return
    if (block !== -1 && !stripped.includes('*/', block)) inBlock = true
    violations.push({
      key: `${rel}:${index + 1} :: ${line.trim().slice(0, 80)}`,
      detail: 'zero comments — names and types carry meaning; delete or extract',
    })
  })
}

report('check-no-comments', violations, loadBaseline('check-no-comments'))
