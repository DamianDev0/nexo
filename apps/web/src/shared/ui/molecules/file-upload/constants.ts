export const DEFAULT_ACCEPT = 'image/png,image/jpeg,image/svg+xml,image/webp'
export const DEFAULT_MAX_SIZE_MB = 5
export const BYTES_PER_KB = 1024
export const BYTES_PER_MB = 1024 * 1024
export const PROGRESS_TICK_MS = 150
export const PROGRESS_CEILING = 90
export const PROGRESS_STEP_MAX = 12
export const PROGRESS_COMPLETE = 100
export const PROGRESS_RESET_DELAY_MS = 500

export function formatFileSize(bytes: number): string {
  if (bytes < BYTES_PER_KB) return `${bytes} B`
  if (bytes < BYTES_PER_MB) return `${(bytes / BYTES_PER_KB).toFixed(1)} KB`
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`
}
