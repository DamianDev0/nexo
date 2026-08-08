import { loadBaseline, readLines, relPath, report, walkSource } from './lib.mjs'

const MAX_PROPS = 5
const DECLARATION = /^\s*(?:export\s+)?(?:interface\s+(\w*Props)\b|type\s+(\w*Props)\s*=\s*\{)/

function countTopLevelProps(lines, startIndex) {
  let depth = 0
  let props = 0
  for (let i = startIndex; i < lines.length; i += 1) {
    const line = lines[i]
    for (const char of line) {
      if (char === '{' || char === '(' || char === '<') depth += 1
      if (char === '}' || char === ')' || char === '>') depth -= 1
    }
    if (i > startIndex && depth <= 0) return props
    if (i === startIndex) continue
    if (depth === 1 && /^\s*(?:readonly\s+)?[\w$]+\??\s*:/.test(line)) props += 1
  }
  return props
}

const violations = []
for (const file of walkSource()) {
  if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue
  const rel = relPath(file)
  const lines = readLines(file)
  lines.forEach((line, index) => {
    const match = DECLARATION.exec(line)
    if (!match) return
    const name = match[1] ?? match[2]
    const count = countTopLevelProps(lines, index)
    if (count > MAX_PROPS) {
      violations.push({
        key: `${rel} :: ${name}`,
        detail: `${count} props (max ${MAX_PROPS}) — group with object-as-props by cohesion`,
      })
    }
  })
}

report('check-props-count', violations, loadBaseline('check-props-count'))
