import { loadBaseline, readLines, relPath, report, walkSource } from './lib.mjs'

const MAX_LINES = 200

const violations = walkSource()
  .map((file) => ({ file, lines: readLines(file).length }))
  .filter(({ lines }) => lines > MAX_LINES)
  .map(({ file, lines }) => ({
    key: relPath(file),
    detail: `${lines} lines (max ${MAX_LINES})`,
  }))

report('check-file-size', violations, loadBaseline('check-file-size'))
