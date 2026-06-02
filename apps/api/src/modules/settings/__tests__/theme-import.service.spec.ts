import { BadRequestException } from '@nestjs/common'
import { isHexColor } from '@/shared/color/color.util'
import { ThemeImportService } from '../services/theme-import.service'

describe('ThemeImportService', () => {
  const service = new ThemeImportService()

  describe('shadcn CSS variables', () => {
    const css = `:root {
      --primary: #1B4FD8;
      --secondary: #6366F1;
      --color-accent: #818CF8;
      --sidebar: #0F172A;
      --muted: #f5f5f5;
    }`

    it('extracts brand seeds, stripping the color- prefix', () => {
      const seeds = service.parse(css)
      expect(seeds.primary).toBe('#1B4FD8')
      expect(seeds.secondary).toBe('#6366F1')
      expect(seeds.accent).toBe('#818CF8')
      expect(seeds.sidebar).toBe('#0F172A')
    })

    it('derives readable foregrounds when not provided', () => {
      const seeds = service.parse(css)
      expect(seeds.primaryForeground && isHexColor(seeds.primaryForeground)).toBe(true)
      expect(seeds.sidebarForeground && isHexColor(seeds.sidebarForeground)).toBe(true)
    })
  })

  describe('DTCG JSON', () => {
    it('extracts color tokens from a nested DTCG document', () => {
      const dtcg = JSON.stringify({
        color: {
          light: {
            primary: { $type: 'color', $value: '#7C3AED' },
            accent: { $type: 'color', $value: '#A78BFA' },
          },
        },
      })
      const seeds = service.parse(dtcg)
      expect(seeds.primary).toBe('#7C3AED')
      expect(seeds.accent).toBe('#A78BFA')
    })

    it('rejects invalid JSON', () => {
      expect(() => service.parse('{ not valid')).toThrow(BadRequestException)
    })
  })

  describe('validation', () => {
    it('throws when no primary color is found', () => {
      expect(() => service.parse('--muted: #f5f5f5;')).toThrow(BadRequestException)
    })

    it('throws on empty input', () => {
      expect(() => service.parse('   ')).toThrow(BadRequestException)
    })

    it('ignores non-hex values', () => {
      const seeds = service.parse('--primary: #1B4FD8; --secondary: rgb(0,0,0);')
      expect(seeds.primary).toBe('#1B4FD8')
      expect(seeds.secondary).toBeUndefined()
    })
  })
})
