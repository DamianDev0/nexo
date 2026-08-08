import { loadBaseline, readLines, relPath, report, walkSource } from './lib.mjs'

const DEEP_IMPORT =
  /@\/(features|entities|widgets|views)\/([\w-]+)\/(ui|model|lib|query|config|api)\b/

const ALLOWED_DEEP = [/@\/shared\//]

const violations = []
for (const file of walkSource()) {
  const rel = relPath(file)
  readLines(file).forEach((line, index) => {
    if (!/^\s*import\b/.test(line)) return
    if (ALLOWED_DEEP.some((p) => p.test(line))) return
    const match = DEEP_IMPORT.exec(line)
    if (!match) return
    const [, layer, slice] = match
    const ownSlice = rel.startsWith(`src/${layer}/${slice}/`)
    if (ownSlice) return
    violations.push({
      key: `${rel}:${index + 1} :: ${line.trim().slice(0, 90)}`,
      detail: `deep import into ${layer}/${slice} internals — import from its index.ts`,
    })
  })
}

report('check-cross-slice-imports', violations, loadBaseline('check-cross-slice-imports'))
