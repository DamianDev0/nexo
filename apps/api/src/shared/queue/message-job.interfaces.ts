export interface MessageJobData {
  schemaName: string
  tenantId: string
  templateId: string
  channel: string
  recipient: string
  subject: string | null
  renderedBody: string
  variables: Record<string, string>
}
