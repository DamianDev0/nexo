export type DuplicateMatch = {
  id: string
  matchField: string
  matchValue: string
  similarity: number
  entityType: 'contact' | 'company'
  name: string
  createdAt: string
}

export type DuplicateCheckResult = {
  hasDuplicates: boolean
  matches: DuplicateMatch[]
}
