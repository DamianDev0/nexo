#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const MODULES_DIR = 'apps/api/src/modules'
const BASELINE_PATH = 'scripts/api-architecture-baseline.json'

const SQL_ALLOWED_SEGMENTS = new Set([
  'repositories',
  'queries',
  'constants',
  'entities',
  'migrations',
])
const CROSS_MODULE_ALLOWED = new Set(['audit-log', 'auth', 'tenants'])
const SERVICE_MAX_LINES = 400

const SQL_REGEX =
  /\b(SELECT\s+|INSERT\s+INTO\s+|UPDATE\s+[\w"]+\s+SET\s+|DELETE\s+FROM\s+|CREATE\s+TABLE|ALTER\s+TABLE)|\.createQueryBuilder\(|\bqr\.query\(/
const IMPORT_REGEX = /from\s+['"]([^'"]+)['"]/

function moduleOf(relPath) {
  const parts = relPath.split(path.sep)
  const idx = parts.indexOf('modules')
  return idx >= 0 ? parts[idx + 1] : null
}

function segmentsOf(relPath) {
  return new Set(relPath.split(path.sep))
}

function resolveImport(relPath, spec) {
  if (spec.startsWith('@/')) return path.join('apps/api/src', spec.slice(2))
  if (spec.startsWith('.')) return path.normalize(path.join(path.dirname(relPath), spec))
  return null
}

const rules = [
  {
    id: 'sql-outside-repository',
    describe:
      'Raw SQL / query builder only allowed in repositories|queries|constants|entities|migrations',
    check(relPath, lines) {
      const segs = segmentsOf(relPath)
      if ([...SQL_ALLOWED_SEGMENTS].some((s) => segs.has(s))) return []
      const out = []
      lines.forEach((line, i) => {
        if (SQL_REGEX.test(line)) {
          out.push({
            line: i + 1,
            message: `SQL/query-builder found: move it to a repository (${line.trim().slice(0, 80)})`,
          })
        }
      })
      return out
    },
  },
  {
    id: 'mapper-impurity',
    describe: 'Mappers must be pure: no DI, no DB, no services/repositories imports',
    check(relPath, lines) {
      if (!segmentsOf(relPath).has('mappers')) return []
      const out = []
      lines.forEach((line, i) => {
        if (/@Injectable\(/.test(line)) {
          out.push({
            line: i + 1,
            message: 'Mapper must not be @Injectable — export pure functions',
          })
        }
        const m = line.match(IMPORT_REGEX)
        if (m && /(\/services\/|\/repositories\/|shared\/database|typeorm)/.test(m[1])) {
          out.push({ line: i + 1, message: `Mapper imports forbidden dependency: ${m[1]}` })
        }
      })
      return out
    },
  },
  {
    id: 'repository-imports-dto',
    describe: 'Repositories return Row types; DTOs are mapped at the service layer',
    check(relPath, lines) {
      const segs = segmentsOf(relPath)
      if (!segs.has('repositories') && !segs.has('queries')) return []
      const out = []
      lines.forEach((line, i) => {
        const m = line.match(IMPORT_REGEX)
        if (m && /(\/dto\/|\.dto$)/.test(m[1])) {
          out.push({
            line: i + 1,
            message: `Repository imports DTO: ${m[1]} — return Row types and map in the service`,
          })
        }
      })
      return out
    },
  },
  {
    id: 'controller-imports-repository',
    describe: 'Controllers talk to services only',
    check(relPath, lines) {
      if (!/\.controller\.ts$/.test(relPath)) return []
      const out = []
      lines.forEach((line, i) => {
        const m = line.match(IMPORT_REGEX)
        if (m && /(\/repositories\/|\.repository$|\/queries\/)/.test(m[1])) {
          out.push({
            line: i + 1,
            message: `Controller imports repository: ${m[1]} — go through a service`,
          })
        }
      })
      return out
    },
  },
  {
    id: 'sql-interpolation',
    describe: 'No runtime values interpolated into SQL template literals — use $n parameters',
    check(relPath, lines) {
      const out = []
      const content = lines.join('\n')
      for (const template of content.matchAll(/`[^`]*`/gs)) {
        if (!SQL_REGEX.test(template[0])) continue
        for (const m of template[0].matchAll(/\$\{([^}]+)\}/g)) {
          const expr = m[1].trim()
          const safe =
            /^[A-Z][A-Z0-9_]*$/.test(expr) ||
            expr.startsWith('this.') ||
            expr.includes('.join(') ||
            expr.includes('.length') ||
            /^(where|exclude|exclusion|schema|schemaName|orderBy|sets|updates)$/.test(expr)
          if (safe) continue
          const offset = template.index + m.index
          const line = content.slice(0, offset).split('\n').length
          out.push({
            line,
            message: `Interpolated \${${expr}} inside SQL — pass it as a $n parameter`,
          })
        }
      }
      return out
    },
  },
  {
    id: 'route-missing-auth',
    describe: 'Every controller route needs an explicit @Auth / @ApiEndpoint / @Public',
    check(relPath, lines) {
      if (!/\.controller\.ts$/.test(relPath)) return []
      const out = []
      lines.forEach((line, i) => {
        if (!/^\s*@(Get|Post|Patch|Put|Delete)\s*\(/.test(line)) return
        const start = Math.max(0, i - 6)
        const end = Math.min(lines.length, i + 12)
        const block = lines.slice(start, end).join('\n')
        if (!/@(Auth|ApiEndpoint|Public)\s*\(?/.test(block)) {
          out.push({
            line: i + 1,
            message: `${line.trim()} has no @Auth/@ApiEndpoint/@Public in its decorator block`,
          })
        }
      })
      return out
    },
  },
  {
    id: 'cross-module-import',
    describe: 'Modules communicate via EventBus only (allowed infra: audit-log, auth, tenants)',
    check(relPath, lines) {
      const ownModule = moduleOf(relPath)
      if (!ownModule) return []
      const out = []
      lines.forEach((line, i) => {
        const m = line.match(IMPORT_REGEX)
        if (!m) return
        const resolved = resolveImport(relPath, m[1])
        if (!resolved) return
        const target = moduleOf(resolved)
        if (target && target !== ownModule && !CROSS_MODULE_ALLOWED.has(target)) {
          out.push({
            line: i + 1,
            message: `Imports module "${target}" from "${ownModule}" — use EventBus`,
          })
        }
      })
      return out
    },
  },
]

const warnings = [
  {
    id: 'service-too-long',
    check(relPath, lines) {
      if (!/\.service\.ts$/.test(relPath)) return []
      if (lines.length <= SERVICE_MAX_LINES) return []
      return [
        {
          line: 1,
          message: `Service has ${lines.length} lines (soft cap ${SERVICE_MAX_LINES}) — split by use case`,
        },
      ]
    },
  },
]

function collectAllFiles() {
  return readdirSync(path.join(ROOT, MODULES_DIR), { recursive: true })
    .map((f) => path.join(MODULES_DIR, f.toString()))
    .filter((f) => f.endsWith('.ts') && !isExcluded(f))
}

function isExcluded(relPath) {
  return (
    relPath.endsWith('.spec.ts') ||
    relPath.endsWith('.d.ts') ||
    relPath.includes('__tests__') ||
    relPath.includes(`${path.sep}test${path.sep}`)
  )
}

function checkFile(relPath) {
  const content = readFileSync(path.join(ROOT, relPath), 'utf8')
  const lines = content.split('\n')
  const errors = []
  for (const rule of rules) {
    for (const v of rule.check(relPath, lines)) {
      errors.push({ rule: rule.id, ...v })
    }
  }
  const warns = []
  for (const rule of warnings) {
    for (const v of rule.check(relPath, lines)) {
      warns.push({ rule: rule.id, ...v })
    }
  }
  return { errors, warns }
}

function loadBaseline() {
  if (!existsSync(path.join(ROOT, BASELINE_PATH))) return {}
  return JSON.parse(readFileSync(path.join(ROOT, BASELINE_PATH), 'utf8'))
}

const args = process.argv.slice(2)
const updateBaseline = args.includes('--update-baseline')
const checkAll = args.includes('--all') || updateBaseline

const files = checkAll
  ? collectAllFiles()
  : args
      .filter((a) => !a.startsWith('--'))
      .map((a) => path.relative(ROOT, path.resolve(a)))
      .filter((f) => f.startsWith(MODULES_DIR) && f.endsWith('.ts') && !isExcluded(f))
      .filter((f) => existsSync(path.join(ROOT, f)))

if (updateBaseline) {
  const baseline = {}
  for (const file of files) {
    const { errors } = checkFile(file)
    if (errors.length) baseline[file] = [...new Set(errors.map((e) => e.rule))].sort()
  }
  writeFileSync(path.join(ROOT, BASELINE_PATH), JSON.stringify(baseline, null, 2) + '\n')
  console.log(
    `Baseline written: ${Object.keys(baseline).length} files grandfathered → ${BASELINE_PATH}`,
  )
  process.exit(0)
}

const baseline = loadBaseline()
let newViolations = 0
let grandfathered = 0
let warnCount = 0

for (const file of files) {
  const { errors, warns } = checkFile(file)
  const allowedRules = new Set(baseline[file] ?? [])
  const fresh = errors.filter((e) => !allowedRules.has(e.rule))
  grandfathered += errors.length - fresh.length

  if (fresh.length) {
    console.error(`\n✖ ${file}`)
    for (const e of fresh) {
      console.error(`  L${e.line} [${e.rule}] ${e.message}`)
    }
    newViolations += fresh.length
  }
  for (const w of warns) {
    console.warn(`\n⚠ ${file}\n  L${w.line} [${w.rule}] ${w.message}`)
    warnCount++
  }
}

if (grandfathered) {
  console.warn(
    `\n⚠ ${grandfathered} grandfathered violation(s) skipped (see ${BASELINE_PATH} — shrink it as you refactor)`,
  )
}

if (newViolations) {
  console.error(`\n✖ ${newViolations} architecture violation(s). Commit blocked.`)
  console.error(
    'Rules: SQL only in repositories/queries · mappers pure · repos return Rows (no DTOs) · controllers → services only · cross-module via EventBus.',
  )
  console.error(
    'See docs/backend-standards.md. If intentionally grandfathering legacy code: pnpm check:arch --update-baseline',
  )
  process.exit(1)
}

if (!newViolations && files.length) {
  console.log(
    `✔ Architecture check passed (${files.length} file(s)${warnCount ? `, ${warnCount} warning(s)` : ''})`,
  )
}
