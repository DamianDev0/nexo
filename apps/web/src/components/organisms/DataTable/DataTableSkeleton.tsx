import { Skeleton } from '@/components/atoms/skeleton'

interface DataTableSkeletonProps {
  readonly columnCount: number
  readonly rowCount?: number
  readonly hasCheckbox?: boolean
  readonly hasActions?: boolean
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
  hasCheckbox = false,
  hasActions = false,
}: DataTableSkeletonProps) {
  const totalCols = columnCount + (hasCheckbox ? 1 : 0) + (hasActions ? 1 : 0)

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b">
              {Array.from({ length: totalCols }, (_, i) => (
                <th key={`head-${i}`} className="h-10 px-4">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, rowIdx) => (
              <tr key={`row-${rowIdx}`} className="border-b">
                {hasCheckbox && (
                  <td className="p-2 w-10">
                    <Skeleton className="size-4 rounded-sm" />
                  </td>
                )}
                {Array.from({ length: columnCount }, (_, colIdx) => (
                  <td key={`cell-${rowIdx}-${colIdx}`} className="p-2 px-4">
                    <Skeleton
                      className="h-4"
                      style={{ width: `${60 + ((rowIdx + colIdx) % 4) * 15}%` }}
                    />
                  </td>
                ))}
                {hasActions && (
                  <td className="p-2 w-10">
                    <Skeleton className="size-8 rounded-md" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
