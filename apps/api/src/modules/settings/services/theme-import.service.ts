import { BadRequestException, Injectable } from '@nestjs/common'
import type { ThemeColors } from '@repo/shared-types'
import { isHexColor, readableForeground } from '@/shared/color/color.util'

const CSS_VAR_PATTERN = /--(?:color-)?([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g

function tokenValue(node: unknown): string | null {
  if (node && typeof node === 'object' && '$value' in node) {
    const value = (node as Record<string, unknown>).$value
    return typeof value === 'string' ? value : null
  }
  return null
}

@Injectable()
export class ThemeImportService {
  parse(source: string): Partial<ThemeColors> {
    const trimmed = source.trim()
    if (!trimmed) throw new BadRequestException('Empty theme source')

    const found = trimmed.startsWith('{') ? this.fromDtcg(trimmed) : this.fromCssVars(trimmed)
    return this.toSeeds(found)
  }

  private fromCssVars(source: string): Map<string, string> {
    const found = new Map<string, string>()
    for (const match of source.matchAll(CSS_VAR_PATTERN)) {
      const [, name, value] = match
      if (name && value && isHexColor(value)) found.set(name, value)
    }
    return found
  }

  private fromDtcg(source: string): Map<string, string> {
    let parsed: unknown
    try {
      parsed = JSON.parse(source)
    } catch {
      throw new BadRequestException('Invalid JSON in theme source')
    }

    const found = new Map<string, string>()
    this.collectTokens(parsed, found)
    return found
  }

  private collectTokens(node: unknown, out: Map<string, string>): void {
    if (!node || typeof node !== 'object') return

    for (const [key, child] of Object.entries(node)) {
      const value = tokenValue(child)
      if (value && isHexColor(value)) {
        out.set(key, value)
      } else {
        this.collectTokens(child, out)
      }
    }
  }

  private toSeeds(found: Map<string, string>): Partial<ThemeColors> {
    const primary = found.get('primary')
    if (!primary) {
      throw new BadRequestException(
        'No recognizable theme colors found (a "primary" color is required)',
      )
    }

    const seeds: Partial<ThemeColors> = {
      primary,
      primaryForeground: found.get('primary-foreground') ?? readableForeground(primary),
    }

    const secondary = found.get('secondary')
    if (secondary) seeds.secondary = secondary

    const accent = found.get('accent')
    if (accent) seeds.accent = accent

    const sidebar = found.get('sidebar')
    if (sidebar) {
      seeds.sidebar = sidebar
      seeds.sidebarForeground = found.get('sidebar-foreground') ?? readableForeground(sidebar)
    }

    return seeds
  }
}
