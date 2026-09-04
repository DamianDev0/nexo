export type SkeletonCell = {
  readonly id: string
  readonly width: number
  readonly kind: 'select' | 'lead' | 'plain'
}

export function skeletonCells(widths: ReadonlyArray<number>): ReadonlyArray<SkeletonCell> {
  return widths.map((width, index) => ({
    id: `col-${index + 1}`,
    width,
    kind: index === 0 ? 'select' : index === 1 ? 'lead' : 'plain',
  }))
}
