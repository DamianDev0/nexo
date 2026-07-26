import { loadBaseline, readLines, relPath, report, walkSource } from './lib.mjs'

const COLOR_PATTERN = /(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\()/
const EXCLUDED = [/styles\/globals\.css$/, /shared\/config\/tokens/]
const FALSE_POSITIVE = /(href=["']#|url\(#|\bid=["']#?)/

const violations = []
for (const file of walkSource()) {
  if (EXCLUDED.some((p) => p.test(file))) continue
  for (const line of readLines(file)) {
    if (!COLOR_PATTERN.test(line) || FALSE_POSITIVE.test(line)) continue
    violations.push({ key: `${relPath(file)} :: ${line.trim().slice(0, 80)}` })
  }
}

report('check-colors', violations, loadBaseline('check-colors'))
