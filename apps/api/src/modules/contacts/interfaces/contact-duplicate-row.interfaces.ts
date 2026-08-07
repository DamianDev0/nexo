export interface DuplicateProbe {
  email?: string | null
  documentNumber?: string | null
  phone?: string | null
  whatsapp?: string | null
  firstName?: string | null
  lastName?: string | null
}

export interface DuplicateRow {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  document_number: string | null
}
