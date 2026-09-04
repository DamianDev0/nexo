import { loadBaseline, readLines, relPath, report, walkSource } from './lib.mjs'

const PRIMITIVE = /<(button|input|select|table|textarea)\b/
const VENDOR_BUTTON = /from\s+'@\/shared\/ui\/shadcn\/button'/
const ALLOWED = [/src\/components\//, /src\/shared\/ui\//]

const violations = []
for (const file of walkSource()) {
  if (!file.endsWith('.tsx')) continue
  if (ALLOWED.some((p) => p.test(file))) continue
  for (const line of readLines(file)) {
    if (VENDOR_BUTTON.test(line)) {
      violations.push({
        key: `${relPath(file)} :: ${line.trim().slice(0, 80)}`,
        detail: 'shadcn Button outside shared/ui — use PillButton (ui-standardization Fase 5)',
      })
      continue
    }
    const match = PRIMITIVE.exec(line)
    if (!match) continue
    violations.push({
      key: `${relPath(file)} :: ${line.trim().slice(0, 80)}`,
      detail: `raw <${match[1]}> — use shared UI component`,
    })
  }
}

report('check-html-primitives', violations, loadBaseline('check-html-primitives'))
