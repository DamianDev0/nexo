import { loadBaseline, readLines, relPath, report, walkSource } from './lib.mjs'

const PRIMITIVE = /<(button|input|select|table|textarea)\b/
const ALLOWED = [/src\/components\//, /src\/shared\/ui\//]

const violations = []
for (const file of walkSource()) {
  if (!file.endsWith('.tsx')) continue
  if (ALLOWED.some((p) => p.test(file))) continue
  for (const line of readLines(file)) {
    const match = PRIMITIVE.exec(line)
    if (!match) continue
    violations.push({
      key: `${relPath(file)} :: ${line.trim().slice(0, 80)}`,
      detail: `raw <${match[1]}> — use shared UI component`,
    })
  }
}

report('check-html-primitives', violations, loadBaseline('check-html-primitives'))
