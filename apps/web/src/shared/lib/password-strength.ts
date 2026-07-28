export interface PasswordRequirement {
  readonly key: string
  readonly met: boolean
}

export interface PasswordStrength {
  readonly score: number
  readonly total: number
  readonly requirements: readonly PasswordRequirement[]
}

const RULES: ReadonlyArray<{ key: string; regex: RegExp }> = [
  { key: 'minLength', regex: /.{8,}/ },
  { key: 'number', regex: /\d/ },
  { key: 'lowercase', regex: /[a-z]/ },
  { key: 'uppercase', regex: /[A-Z]/ },
  { key: 'special', regex: /[^a-zA-Z0-9]/ },
]

export function assessPassword(value: string): PasswordStrength {
  const requirements = RULES.map((rule) => ({ key: rule.key, met: rule.regex.test(value) }))
  return {
    score: requirements.filter((req) => req.met).length,
    total: RULES.length,
    requirements,
  }
}
