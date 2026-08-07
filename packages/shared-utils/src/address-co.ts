export interface AddressType {
  readonly canonical: string
  readonly aliases: ReadonlyArray<string>
}

export const CO_ADDRESS_TYPES: ReadonlyArray<AddressType> = [
  { canonical: 'Calle', aliases: ['calle', 'cll', 'cl', 'c'] },
  { canonical: 'Carrera', aliases: ['carrera', 'cra', 'kra', 'kr', 'cr', 'k'] },
  { canonical: 'Avenida', aliases: ['avenida', 'av', 'ave'] },
  { canonical: 'Avenida Carrera', aliases: ['avenida carrera', 'av carrera', 'avcra', 'ak'] },
  { canonical: 'Avenida Calle', aliases: ['avenida calle', 'av calle', 'avcll', 'ac'] },
  { canonical: 'Diagonal', aliases: ['diagonal', 'diag', 'dg'] },
  { canonical: 'Transversal', aliases: ['transversal', 'transv', 'tv', 'tr'] },
  { canonical: 'Circular', aliases: ['circular', 'circ', 'cq'] },
  { canonical: 'Autopista', aliases: ['autopista', 'auto', 'aut'] },
  { canonical: 'Kilómetro', aliases: ['kilometro', 'kilómetro', 'km'] },
  { canonical: 'Manzana', aliases: ['manzana', 'mz', 'mza'] },
  { canonical: 'Vereda', aliases: ['vereda', 'vda'] },
]

const DIACRITICS = /[̀-ͯ]/g

function fold(value: string): string {
  return value.toLowerCase().trim().normalize('NFD').replace(DIACRITICS, '')
}

export function canonicalAddressType(input: string): string | null {
  const needle = fold(input)
  if (!needle) return null
  const exact = CO_ADDRESS_TYPES.find((type) => type.aliases.includes(needle))
  return exact?.canonical ?? null
}

export function suggestAddressTypes(term: string): ReadonlyArray<string> {
  const needle = fold(term)
  if (!needle) return CO_ADDRESS_TYPES.map((type) => type.canonical)
  return CO_ADDRESS_TYPES.filter((type) =>
    type.aliases.some((alias) => alias.startsWith(needle)),
  ).map((type) => type.canonical)
}

export interface AddressDraft {
  readonly type: string
  readonly main: string
  readonly secondary: string
  readonly number: string
  readonly detail: string
}

const ADDRESS_PATTERN =
  /^\s*([a-zA-ZáéíóúñÁÉÍÓÚÑ.]+(?:\s+[a-zA-ZáéíóúñÁÉÍÓÚÑ]+)?)\s*([\dA-Za-z]+)?\s*(?:#|no\.?|nro\.?)?\s*([\dA-Za-z]+)?\s*-?\s*(\d+)?\s*(.*)$/i

export function parseCOAddress(value: string): AddressDraft | null {
  const match = ADDRESS_PATTERN.exec(value)
  if (!match) return null

  const type = canonicalAddressType(match[1] ?? '')
  if (!type) return null

  return {
    type,
    main: (match[2] ?? '').toUpperCase(),
    secondary: (match[3] ?? '').toUpperCase(),
    number: match[4] ?? '',
    detail: (match[5] ?? '').trim(),
  }
}

export function formatCOAddress(draft: AddressDraft): string {
  const head = [draft.type, draft.main].filter(Boolean).join(' ')
  const body =
    draft.secondary && draft.number
      ? `#${draft.secondary}-${draft.number}`
      : draft.secondary
        ? `#${draft.secondary}`
        : ''
  return [head, body, draft.detail].filter(Boolean).join(' ').trim()
}

export function normalizeCOAddress(value: string): string {
  const draft = parseCOAddress(value)
  return draft ? formatCOAddress(draft) : value.trim()
}
