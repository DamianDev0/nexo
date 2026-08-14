export interface ContactRow {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly company: string
  readonly email: string
  readonly city: string
  readonly initials: string
  readonly tone: 'lime' | 'warning' | 'info' | 'neutral'
  readonly status: 'open' | 'proposal' | 'risk' | 'won' | 'lost'
}

export const CONTACT_ROWS: ReadonlyArray<ContactRow> = [
  {
    id: 'c1',
    name: 'Andrés Gómez',
    role: 'Purchasing manager',
    company: 'Distrialimentos Andina',
    email: 'agomez@distri.co',
    city: 'Bogotá',
    initials: 'AG',
    tone: 'lime',
    status: 'risk',
  },
  {
    id: 'c2',
    name: 'Laura Vargas',
    role: 'Administrative director',
    company: 'Ferretería El Roble',
    email: 'laura@elroble.com',
    city: 'Medellín',
    initials: 'LV',
    tone: 'warning',
    status: 'proposal',
  },
  {
    id: 'c3',
    name: 'Sofía Martínez',
    role: 'Head of operations',
    company: 'Textiles Medellín',
    email: 'smartinez@txm.co',
    city: 'Medellín',
    initials: 'SM',
    tone: 'info',
    status: 'won',
  },
  {
    id: 'c4',
    name: 'Ricardo Quintero',
    role: 'General manager',
    company: 'Logística del Valle',
    email: 'rq@logisticavalle.co',
    city: 'Cali',
    initials: 'RQ',
    tone: 'neutral',
    status: 'open',
  },
]

export const WORST_ROW: ContactRow = {
  id: 'w1',
  name: 'María del Carmen Rodríguez de Barrancabermeja',
  role: 'Regional coordinator of institutional purchasing',
  company: 'Barrancabermeja Distribuciones y Suministros S.A.S.',
  email: 'maria.rodriguez@barrancabermejadistribuciones.com.co',
  city: 'Barrancabermeja',
  initials: 'MR',
  tone: 'neutral',
  status: 'lost',
}

export const SMART_LISTS = [
  { id: 'all', label: 'All', count: 2786 },
  { id: 'hot', label: 'Hot leads', count: 0 },
  { id: 'working', label: 'Working', count: 36 },
  { id: 'mine', label: 'My leads', count: 195 },
] as const

export const STATUS_TONE = {
  open: { tone: 'neutral', label: 'Open' },
  proposal: { tone: 'info', label: 'Proposal' },
  risk: { tone: 'warning', label: 'At risk' },
  won: { tone: 'positive', label: 'Won' },
  lost: { tone: 'negative', label: 'Lost' },
} as const

export function manyRows(count: number): ReadonlyArray<ContactRow> {
  return Array.from({ length: count }, (_, i) => ({
    ...CONTACT_ROWS[i % CONTACT_ROWS.length]!,
    id: `row-${i}`,
  }))
}
