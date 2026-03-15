import * as fs from 'node:fs'
import * as path from 'node:path'
import Handlebars from 'handlebars'
import './helpers/handlebars.helpers'

const TEMPLATES_DIR = path.join(__dirname, 'templates')
const PARTIALS_DIR = path.join(TEMPLATES_DIR, 'partials')

try {
  for (const file of fs.readdirSync(PARTIALS_DIR)) {
    if (!file.endsWith('.hbs')) continue
    const name = path.basename(file, '.hbs')
    Handlebars.registerPartial(name, fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf-8'))
  }
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  throw new Error(`Failed to load Handlebars partials from ${PARTIALS_DIR}: ${message}`)
}

export function compileTemplate(templateName: string, context: Record<string, unknown>): string {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`)
  let source: string
  try {
    source = fs.readFileSync(templatePath, 'utf-8')
  } catch {
    throw new Error(`Email template not found: ${templateName}`)
  }
  return Handlebars.compile(source)({ ...context, year: new Date().getFullYear() })
}
