import { useQuery } from '@tanstack/react-query'
import { History, RotateCcw } from 'lucide-react'
import type { ThemeHistoryEntry, TenantTheme } from '@repo/shared-types'

import { Button } from '@/components/atoms/button'
import settingsService from '@/core/services/settings.service'

interface ThemeHistoryPanelProps {
  readonly onRestore: (config: Partial<TenantTheme>) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ColorDot({ color }: { readonly color: string }) {
  return (
    <div
      className="size-4 shrink-0 rounded-full border border-border"
      style={{ background: color }}
    />
  )
}

function HistoryCard({
  entry,
  onRestore,
}: {
  readonly entry: ThemeHistoryEntry
  readonly onRestore: () => void
}) {
  const { colors, typography, branding } = entry.previousConfig

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <ColorDot color={colors.primary} />
            <ColorDot color={colors.accent} />
            <ColorDot color={colors.sidebar} />
          </div>
          <span className="text-xs text-muted-foreground">{typography.fontFamily}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{branding.companyName}</span>
          <span>·</span>
          <span>{formatDate(entry.createdAt)}</span>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRestore}
        className="shrink-0 gap-1 text-xs"
      >
        <RotateCcw className="size-3" />
        Restore
      </Button>
    </div>
  )
}

export function ThemeHistoryPanel({ onRestore }: ThemeHistoryPanelProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['settings', 'theme', 'history'],
    queryFn: () => settingsService.getThemeHistory(5),
  })

  if (isLoading) return null
  if (!history?.length) return null

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-1.5">
        <History className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Previous themes</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {history.map((entry) => (
          <HistoryCard
            key={entry.id}
            entry={entry}
            onRestore={() => onRestore(entry.previousConfig)}
          />
        ))}
      </div>
    </div>
  )
}
