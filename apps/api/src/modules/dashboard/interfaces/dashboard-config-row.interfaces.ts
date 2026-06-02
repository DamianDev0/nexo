import type { DashboardLayout } from '@repo/shared-types'

export interface ConfigRow {
  id: string
  user_id: string
  layout: DashboardLayout
  created_at: string
  updated_at: string
}
