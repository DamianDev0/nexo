import { loadBaseline, readLines, relPath, report, walkSource } from './lib.mjs'

const LOCALES = ['en', 'es']
const KEY_LINE = /^(\s*)(?:'([^']+)'|([\w$]+)):\s*(.*)$/
const INLINE_KEYS = /([\w$]+):/g
const STATIC_T = /\bt\(\s*(['"])((?:(?!\1).)+)\1/g
const PLURAL_SUFFIXES = ['', '_one', '_other', '_few', '_many', '_zero', '_two']

function flattenLocale(name) {
  const keys = new Set()
  const stack = []
  for (const raw of readLines(
    new URL(`../src/shared/i18n/locales/${name}.ts`, import.meta.url).pathname,
  )) {
    const line = raw.replace(/\/\/.*$/, '')
    const closes = /^\s*\}[,;]?\s*$/.test(line)
    if (closes) {
      stack.pop()
      continue
    }
    const match = KEY_LINE.exec(line)
    if (!match) continue
    const key = match[2] ?? match[3]
    const rest = match[4].trim()
    if (rest.startsWith('{') && !rest.includes('}')) {
      stack.push(key)
      continue
    }
    if (rest.startsWith('{') && rest.includes('}')) {
      for (const inline of rest.matchAll(INLINE_KEYS)) {
        keys.add([...stack, key, inline[1]].join('.'))
      }
      continue
    }
    keys.add([...stack, key].join('.'))
  }
  return keys
}

const [enKeys, esKeys] = LOCALES.map(flattenLocale)
const violations = []

for (const key of enKeys) {
  if (!esKeys.has(key))
    violations.push({ key: `es.ts missing :: ${key}`, detail: 'present in en.ts only' })
}
for (const key of esKeys) {
  if (!enKeys.has(key))
    violations.push({ key: `en.ts missing :: ${key}`, detail: 'present in es.ts only' })
}

function resolves(key) {
  return PLURAL_SUFFIXES.some((suffix) => enKeys.has(`${key}${suffix}`))
}

for (const file of walkSource()) {
  const rel = relPath(file)
  if (rel.includes('shared/i18n/locales/')) continue
  readLines(file).forEach((line, index) => {
    for (const match of line.matchAll(STATIC_T)) {
      const key = match[2]
      if (!key.includes('.')) continue
      if (!resolves(key)) {
        violations.push({
          key: `${rel}:${index + 1} :: t('${key}')`,
          detail: 'key not found in en.ts',
        })
      }
    }
  })
}

report('check-i18n-sync', violations, loadBaseline('check-i18n-sync'))
