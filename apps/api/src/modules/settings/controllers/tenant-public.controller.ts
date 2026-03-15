import { Controller, Get, Header, NotFoundException, Param, Res } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiProduces, ApiTags } from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import type { Response } from 'express'
import { Public } from '@/shared/decorators/public.decorator'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { TenantConfigService } from '../services/tenant-config.service'
import { BORDER_RADIUS_MAP, FONT_FAMILY_MAP } from '../constants/default-theme'
import type { BrandingPublic } from '@repo/shared-types'

@ApiTags('Tenant Public')
@Controller('tenant')
export class TenantPublicController {
  constructor(
    private readonly configService: TenantConfigService,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  @Get(':slug/theme.css')
  @Public()
  @Header('Content-Type', 'text/css; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiProduces('text/css')
  @ApiParam({ name: 'slug', description: 'Tenant slug' })
  @ApiOperation({ summary: 'Get tenant CSS variables (public, cached 5 min)' })
  async getThemeCss(@Param('slug') slug: string, @Res() res: Response): Promise<void> {
    const tenant = await this.findTenantBySlug(slug)
    const theme = await this.configService.getTheme(tenant.id)
    const { colors, typography, branding } = theme

    const fontValue = FONT_FAMILY_MAP[typography.fontFamily] ?? FONT_FAMILY_MAP.inter
    const radiusValue = BORDER_RADIUS_MAP[typography.borderRadius] ?? BORDER_RADIUS_MAP.md

    const css = `:root {
  --color-primary: ${colors.primary};
  --color-primary-foreground: ${colors.primaryForeground};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-sidebar: ${colors.sidebar};
  --color-sidebar-foreground: ${colors.sidebarForeground};
  --font-family: ${fontValue};
  --border-radius: ${radiusValue};
  --density: ${typography.density};
  --icon-pack: ${theme.iconPack};
  --dark-mode-default: ${theme.darkModeDefault};
  --company-name: "${branding.companyName}";
}
`
    res.type('text/css').send(css)
  }

  @Get(':slug/branding')
  @Public()
  @ApiParam({ name: 'slug', description: 'Tenant slug' })
  @ApiOperation({ summary: 'Get tenant branding info (public)' })
  async getBranding(@Param('slug') slug: string): Promise<BrandingPublic> {
    const tenant = await this.findTenantBySlug(slug)
    const theme = await this.configService.getTheme(tenant.id)
    return {
      companyName: theme.branding.companyName,
      logoUrl: theme.branding.logoUrl,
      faviconUrl: theme.branding.faviconUrl,
      loginBgUrl: theme.branding.loginBgUrl,
      loginTagline: theme.branding.loginTagline,
      darkModeDefault: theme.darkModeDefault,
      primaryColor: theme.colors.primary,
    }
  }

  private async findTenantBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { slug, isActive: true } })
    if (!tenant) throw new NotFoundException('Tenant not found')
    return tenant
  }
}
