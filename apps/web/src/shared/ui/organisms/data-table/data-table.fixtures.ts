export interface ContactRow {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly company: string
  readonly email: string
  readonly city: string
  readonly initials: string
  readonly tone: 'lime' | 'warning' | 'info' | 'neutral'
  readonly selected: boolean
}

export const CONTACT_ROWS: ReadonlyArray<ContactRow> = [
  {
    id: 'c1',
    name: 'Andrés Gómez',
    role: 'Gerente de compras',
    company: 'Distrialimentos Andina',
    email: 'agomez@distri.co',
    city: 'Bogotá',
    initials: 'AG',
    tone: 'lime',
    selected: true,
  },
  {
    id: 'c2',
    name: 'Laura Vargas',
    role: 'Directora administrativa',
    company: 'Ferretería El Roble',
    email: 'laura@elroble.com',
    city: 'Medellín',
    initials: 'LV',
    tone: 'warning',
    selected: true,
  },
  {
    id: 'c3',
    name: 'Sofía Martínez',
    role: 'Jefe de operaciones',
    company: 'Textiles Medellín',
    email: 'smartinez@txm.co',
    city: 'Medellín',
    initials: 'SM',
    tone: 'info',
    selected: false,
  },
  {
    id: 'c4',
    name: 'Ricardo Quintero',
    role: 'Gerente general',
    company: 'Logística del Valle',
    email: 'rq@logisticavalle.co',
    city: 'Cali',
    initials: 'RQ',
    tone: 'neutral',
    selected: false,
  },
]

export const WORST_ROW: ContactRow = {
  id: 'w1',
  name: 'María del Carmen Rodríguez de Barrancabermeja',
  role: 'Coordinadora regional de compras institucionales',
  company: 'Barrancabermeja Distribuciones y Suministros S.A.S.',
  email: 'maria.rodriguez@barrancabermejadistribuciones.com.co',
  city: 'Barrancabermeja',
  initials: 'MR',
  tone: 'neutral',
  selected: false,
}

export function manyRows(count: number): ReadonlyArray<ContactRow> {
  return Array.from({ length: count }, (_, i) => ({
    ...CONTACT_ROWS[i % CONTACT_ROWS.length]!,
    id: `row-${i}`,
    selected: false,
  }))
}
