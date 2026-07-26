export interface City {
  readonly name: string
  readonly coords: readonly [number, number]
  readonly stat: string
  readonly r: number
  readonly primary?: boolean
  readonly labelSide: 'left' | 'right'
}

export interface MapColors {
  readonly accent: string
  readonly label: string
  readonly node: string
  readonly stroke: string
  readonly fill: string
  readonly grid: string
  readonly line: string
}

export const BOGOTA_COORDS: readonly [number, number] = [-74.0721, 4.711]

export const CITIES: readonly City[] = [
  {
    name: 'Bogotá',
    coords: BOGOTA_COORDS,
    stat: '$2.4M pipeline',
    r: 9,
    primary: true,
    labelSide: 'right',
  },
  {
    name: 'Medellín',
    coords: [-75.5636, 6.2442],
    stat: '48 deals',
    r: 7,
    primary: true,
    labelSide: 'left',
  },
  { name: 'Cali', coords: [-76.532, 3.4516], stat: '31 deals', r: 6.5, labelSide: 'left' },
  { name: 'Barranquilla', coords: [-74.7964, 10.9685], stat: '22 deals', r: 6, labelSide: 'right' },
  { name: 'Cartagena', coords: [-75.5144, 10.3997], stat: '18 deals', r: 5.5, labelSide: 'left' },
  { name: 'Bucaramanga', coords: [-73.1198, 7.1193], stat: '14 deals', r: 5, labelSide: 'right' },
  { name: 'Pereira', coords: [-75.6961, 4.8133], stat: '11 deals', r: 4.5, labelSide: 'left' },
  { name: 'Cúcuta', coords: [-72.5078, 7.8939], stat: '8 deals', r: 4, labelSide: 'right' },
]

export const GEOJSON_URL = '/colombia-departments.geojson'

export const PROJECTION_PADDING = {
  left: 20,
  top: 40,
  right: 20,
  bottom: 160,
} as const

export const CORNER_MARK = {
  inset: 16,
  length: 34,
  opacity: '0.3',
  strokeWidth: '.8',
} as const

export const DEPARTMENT_STROKE_WIDTH = '0.45'

export const PIPELINE_LINE = {
  strokeWidth: '0.5',
  dashArray: '3 4',
} as const

export const CITY_NODE = {
  haloOffset: 8,
  haloStrokeWidth: '0.4',
  haloOpacity: '0.15',
  primaryStrokeWidth: '0.9',
  secondaryStrokeWidth: '0.65',
  primaryDotOpacity: '0.9',
  secondaryDotOpacity: '0.65',
  dotRatio: 0.38,
  labelGap: 5,
  primaryNameOpacity: '0.85',
  secondaryNameOpacity: '0.65',
  primaryFontSize: '8.5',
  secondaryFontSize: '7.5',
  statFontSize: '6.5',
  statOpacity: '0.6',
  nameLetterSpacing: '.05em',
  statLetterSpacing: '.04em',
} as const

export const ERROR_TEXT = {
  fontSize: '10',
  message: 'Failed to load map',
} as const

export const MAP_CSS_VARS = {
  accent: '--map-accent',
  label: '--map-label',
  node: '--map-node',
  stroke: '--map-stroke',
  fill: '--map-fill',
  grid: '--map-grid',
  line: '--map-line',
} as const
