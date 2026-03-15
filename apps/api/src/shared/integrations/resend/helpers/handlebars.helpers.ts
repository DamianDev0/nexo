import Handlebars from 'handlebars'

Handlebars.registerHelper('roleLabel', (role: string) =>
  role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' '),
)

Handlebars.registerHelper('capitalize', (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '',
)

Handlebars.registerHelper('uppercase', (value: string) => (value ? value.toUpperCase() : ''))

Handlebars.registerHelper('lowercase', (value: string) => (value ? value.toLowerCase() : ''))

Handlebars.registerHelper('truncate', (value: string, length: number) =>
  value && value.length > length ? `${value.slice(0, length)}…` : value,
)

Handlebars.registerHelper('default', (value: unknown, fallback: unknown) =>
  value !== null && value !== undefined && value !== '' ? value : fallback,
)

Handlebars.registerHelper('pluralize', (count: number, singular: string, plural: string) =>
  count === 1 ? singular : plural,
)

Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b)

Handlebars.registerHelper('ne', (a: unknown, b: unknown) => a !== b)

Handlebars.registerHelper('gt', (a: number, b: number) => a > b)

Handlebars.registerHelper('lt', (a: number, b: number) => a < b)

Handlebars.registerHelper('gte', (a: number, b: number) => a >= b)

Handlebars.registerHelper('lte', (a: number, b: number) => a <= b)

Handlebars.registerHelper('and', (a: unknown, b: unknown) => Boolean(a) && Boolean(b))

Handlebars.registerHelper('or', (a: unknown, b: unknown) => Boolean(a) || Boolean(b))

Handlebars.registerHelper('not', (value: unknown) => !value)

Handlebars.registerHelper('formatDate', (value: string | Date, locale = 'en-US') =>
  new Date(value).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }),
)

Handlebars.registerHelper('formatDateTime', (value: string | Date, locale = 'en-US') =>
  new Date(value).toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
)

Handlebars.registerHelper(
  'includes',
  (arr: unknown[], value: unknown) => Array.isArray(arr) && arr.includes(value),
)

Handlebars.registerHelper('json', (value: unknown) => JSON.stringify(value, null, 2))
