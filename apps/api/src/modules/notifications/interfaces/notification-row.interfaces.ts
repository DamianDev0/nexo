export interface NotificationRow {
  id: string
  user_id: string
  notification_type: string
  title: string
  body: string | null
  entity_type: string | null
  entity_id: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface PreferencesRow {
  id: string
  user_id: string
  in_app: boolean
  email: boolean
  push: boolean
  muted_types: string[]
  created_at: string
  updated_at: string
}
