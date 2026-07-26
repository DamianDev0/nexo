type TokenType = 'number' | 'ident' | 'op' | 'paren' | 'comma'

interface Token {
  type: TokenType
  value: string
}

const FUNCTIONS: Record<string, (args: number[]) => number> = {
  min: (a) => Math.min(...a),
  max: (a) => Math.max(...a),
  round: ([x]) => Math.round(x ?? 0),
  floor: ([x]) => Math.floor(x ?? 0),
  ceil: ([x]) => Math.ceil(x ?? 0),
  abs: ([x]) => Math.abs(x ?? 0),
}

const TOKEN_PATTERN = /\s*(\d*\.?\d+|[A-Za-z_]\w*|[()+\-*/,])/y

function tokenize(input: string): Token[] | null {
  const tokens: Token[] = []
  let lastIndex = 0
  TOKEN_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = TOKEN_PATTERN.exec(input)) !== null) {
    const raw = match[1]
    if (raw === undefined) return null
    lastIndex = TOKEN_PATTERN.lastIndex

    if (/^\d/.test(raw) || raw.includes('.')) tokens.push({ type: 'number', value: raw })
    else if (/^[A-Za-z_]/.test(raw)) tokens.push({ type: 'ident', value: raw })
    else if (raw === '(' || raw === ')') tokens.push({ type: 'paren', value: raw })
    else if (raw === ',') tokens.push({ type: 'comma', value: raw })
    else tokens.push({ type: 'op', value: raw })
  }

  return input.slice(lastIndex).trim() === '' ? tokens : null
}

class Parser {
  private pos = 0

  constructor(
    private readonly tokens: Token[],
    private readonly values: Record<string, number>,
  ) {}

  parse(): number {
    const result = this.expression()
    if (this.pos !== this.tokens.length) throw new Error('unexpected trailing tokens')
    return result
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos]
  }

  private expression(): number {
    let left = this.term()
    let op = this.peek()
    while (op?.type === 'op' && (op.value === '+' || op.value === '-')) {
      this.pos++
      const right = this.term()
      left = op.value === '+' ? left + right : left - right
      op = this.peek()
    }
    return left
  }

  private term(): number {
    let left = this.factor()
    let op = this.peek()
    while (op?.type === 'op' && (op.value === '*' || op.value === '/')) {
      this.pos++
      const right = this.factor()
      if (op.value === '/' && right === 0) throw new Error('division by zero')
      left = op.value === '*' ? left * right : left / right
      op = this.peek()
    }
    return left
  }

  private factor(): number {
    const token = this.peek()
    if (!token) throw new Error('unexpected end of expression')

    if (token.type === 'op' && token.value === '-') {
      this.pos++
      return -this.factor()
    }
    if (token.type === 'number') {
      this.pos++
      return Number.parseFloat(token.value)
    }
    if (token.type === 'paren' && token.value === '(') {
      return this.group()
    }
    if (token.type === 'ident') {
      return this.identifier(token.value)
    }
    throw new Error(`unexpected token "${token.value}"`)
  }

  private group(): number {
    this.pos++ // consume '('
    const value = this.expression()
    if (this.peek()?.value !== ')') throw new Error('missing closing parenthesis')
    this.pos++
    return value
  }

  private identifier(name: string): number {
    this.pos++
    if (this.peek()?.value === '(') {
      const fn = FUNCTIONS[name]
      if (!fn) throw new Error(`unknown function "${name}"`)
      return fn(this.arguments())
    }
    const value = this.values[name]
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError(`unknown or non-numeric field "${name}"`)
    }
    return value
  }

  private arguments(): number[] {
    this.pos++ // consume '('
    const args: number[] = [this.expression()]
    while (this.peek()?.type === 'comma') {
      this.pos++
      args.push(this.expression())
    }
    if (this.peek()?.value !== ')') throw new Error('missing closing parenthesis')
    this.pos++
    return args
  }
}

export function evaluateFormula(expression: string, values: Record<string, number>): number | null {
  const tokens = tokenize(expression)
  if (!tokens || tokens.length === 0) return null

  try {
    const result = new Parser(tokens, values).parse()
    return Number.isFinite(result) ? result : null
  } catch {
    return null
  }
}
