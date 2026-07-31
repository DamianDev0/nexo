import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = new URL('../src', import.meta.url).pathname

const VENDOR_DIRS = new Set(['shadcn', 'smoothui', 'kokonutui', 'ruixen', 'vuesax'])

function isVendorDir(dir, entry) {
  return dir.endsWith(join('shared', 'ui')) && VENDOR_DIRS.has(entry)
}

export function walkSource(dir = SRC, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (isVendorDir(dir, entry)) continue
      walkSource(full, files)
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full)
    }
  }
  return files
}

export function relPath(file) {
  return relative(join(SRC, '..'), file)
}

export function readLines(file) {
  return readFileSync(file, 'utf8').split('\n')
}

export function loadBaseline(name) {
  try {
    const url = new URL(`./baselines/${name}.json`, import.meta.url)
    return new Set(JSON.parse(readFileSync(url, 'utf8')))
  } catch {
    return new Set()
  }
}

export function report(checkName, violations, baseline) {
  if (process.argv.includes('--update')) {
    const dir = new URL('./baselines/', import.meta.url).pathname
    mkdirSync(dir, { recursive: true })
    writeFileSync(
      join(dir, `${checkName}.json`),
      JSON.stringify(
        violations.map((v) => v.key),
        null,
        2,
      ) + '\n',
    )
    console.log(`[${checkName}] baseline updated: ${violations.length} entries frozen`)
    return
  }

  const fresh = violations.filter((v) => !baseline.has(v.key))
  const fixed = [...baseline].filter((key) => !violations.some((v) => v.key === key))

  if (fixed.length > 0) {
    console.log(
      `[${checkName}] ${fixed.length} baseline entries fixed — remove them from scripts/baselines/${checkName}.json:`,
    )
    for (const key of fixed) console.log(`  - ${key}`)
  }

  if (fresh.length === 0) {
    console.log(`[${checkName}] OK (${violations.length} legacy in baseline)`)
    return
  }

  console.error(`[${checkName}] ${fresh.length} new violation(s):`)
  for (const v of fresh) {
    const suffix = v.detail ? ` — ${v.detail}` : ''
    console.error(`  ${v.key}${suffix}`)
  }
  process.exit(1)
}
