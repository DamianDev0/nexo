import { loadBaseline, readLines, relPath, report, walkSource } from './lib.mjs'

const RAW_TEXT_TAG = /<(p|span)\s[^>]*className="([^"]*)"/
const TYPOGRAPHY_CLASS =
  /(^|\s)(text-(?!left|right|center|justify|wrap|nowrap|balance|pretty|ellipsis|clip)|font-|tracking-|leading-|uppercase|lowercase|capitalize)/
const SHARED_UI = /src\/shared\/ui\//

const violations = []
for (const file of walkSource()) {
  if (SHARED_UI.test(file) || !file.endsWith('.tsx')) continue
  for (const line of readLines(file)) {
    const match = RAW_TEXT_TAG.exec(line)
    if (!match || !TYPOGRAPHY_CLASS.test(match[2])) continue
    violations.push({
      key: `${relPath(file)} :: ${line.trim().slice(0, 80)}`,
      detail: 'styled <p>/<span> outside shared/ui — use <Text> (shared/ui/atoms/text)',
    })
  }
}

report('check-typography', violations, loadBaseline('check-typography'))
