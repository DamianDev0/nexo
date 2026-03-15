import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CacheService } from '@/shared/cache/cache.service'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { TenantThemeHistory } from '../entities/tenant-theme-history.entity'
import { DEFAULT_THEME } from '../constants/default-theme'
import { DEFAULT_NOMENCLATURE } from '../constants/default-nomenclature'
import { DEFAULT_SIDEBAR_CONFIG } from '../constants/default-sidebar'
import type { TenantTheme } from '../interfaces/tenant-theme.interface'
import type { TenantNomenclature } from '../interfaces/nomenclature.interface'
import type { SidebarConfig } from '../interfaces/sidebar-config.interface'
import type {
  CustomFieldsConfig,
  FieldPermissionsConfig,
} from '../interfaces/custom-field.interface'

const THEME_TTL = 600
const NOMENCLATURE_TTL = 600
const SIDEBAR_TTL = 300
const HISTORY_LIMIT = 30

interface TenantFullConfig {
  theme?: TenantTheme
  nomenclature?: TenantNomenclature
  sidebarConfig?: SidebarConfig
  customFields?: CustomFieldsConfig
  fieldPermissions?: FieldPermissionsConfig
  [key: string]: unknown
}

@Injectable()
export class TenantConfigService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantThemeHistory)
    private readonly historyRepo: Repository<TenantThemeHistory>,
    private readonly cache: CacheService,
  ) {}

  // ─── Theme ────────────────────────────────────────────────────────────────

  async getTheme(tenantId: string): Promise<TenantTheme> {
    const cached = await this.cache.get<TenantTheme>(this.themeKey(tenantId))
    if (cached) return cached

    const config = await this.getRawConfig(tenantId)
    const theme = {
      ...DEFAULT_THEME,
      ...(config.theme as Partial<TenantTheme> | null | undefined),
    } as TenantTheme
    await this.cache.set(this.themeKey(tenantId), theme, THEME_TTL)
    return theme
  }

  async updateTheme(
    tenantId: string,
    patch: Partial<TenantTheme>,
    changedBy: string,
    slug: string,
  ): Promise<TenantTheme> {
    const current = await this.getTheme(tenantId)
    const updated = deepMergeTheme(current, patch)

    await this.writeHistory(tenantId, changedBy, current)
    await this.saveConfigSection(tenantId, 'theme', updated)
    await this.invalidateAll(tenantId, slug)
    return updated
  }

  async getThemeHistory(tenantId: string, limit = 5): Promise<TenantThemeHistory[]> {
    return this.historyRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 10),
    })
  }

  async restoreTheme(
    historyId: string,
    tenantId: string,
    changedBy: string,
    slug: string,
  ): Promise<TenantTheme> {
    const record = await this.historyRepo.findOneOrFail({ where: { id: historyId, tenantId } })
    const current = await this.getTheme(tenantId)

    await this.writeHistory(tenantId, changedBy, current)
    await this.saveConfigSection(tenantId, 'theme', record.previousConfig)
    await this.invalidateAll(tenantId, slug)
    return record.previousConfig
  }

  // ─── Nomenclature ─────────────────────────────────────────────────────────

  async getNomenclature(tenantId: string): Promise<TenantNomenclature> {
    const cached = await this.cache.get<TenantNomenclature>(this.nomenclatureKey(tenantId))
    if (cached) return cached

    const config = await this.getRawConfig(tenantId)
    const raw = (config.nomenclature ?? {}) as unknown as Partial<TenantNomenclature>
    const nomenclature = deepMerge(
      DEFAULT_NOMENCLATURE as unknown as Record<string, unknown>,
      raw as Record<string, unknown>,
    ) as unknown as TenantNomenclature
    await this.cache.set(this.nomenclatureKey(tenantId), nomenclature, NOMENCLATURE_TTL)
    return nomenclature
  }

  async updateNomenclature(
    tenantId: string,
    patch: Partial<TenantNomenclature>,
    slug: string,
  ): Promise<TenantNomenclature> {
    const current = await this.getNomenclature(tenantId)
    const updated = deepMerge(
      current as unknown as Record<string, unknown>,
      patch as Record<string, unknown>,
    ) as unknown as TenantNomenclature

    await this.saveConfigSection(tenantId, 'nomenclature', updated)
    await this.invalidateAll(tenantId, slug)
    return updated
  }

  // ─── Sidebar ──────────────────────────────────────────────────────────────

  async getSidebarConfig(tenantId: string): Promise<SidebarConfig> {
    const cached = await this.cache.get<SidebarConfig>(this.sidebarKey(tenantId))
    if (cached) return cached

    const config = await this.getRawConfig(tenantId)
    const sidebar = (config.sidebarConfig ?? DEFAULT_SIDEBAR_CONFIG) as SidebarConfig
    await this.cache.set(this.sidebarKey(tenantId), sidebar, SIDEBAR_TTL)
    return sidebar
  }

  async updateSidebarConfig(
    tenantId: string,
    updated: SidebarConfig,
    slug: string,
  ): Promise<SidebarConfig> {
    await this.saveConfigSection(tenantId, 'sidebarConfig', updated)
    await this.invalidateAll(tenantId, slug)
    return updated
  }

  // ─── Custom fields ────────────────────────────────────────────────────────

  async getCustomFields(tenantId: string): Promise<CustomFieldsConfig> {
    const config = await this.getRawConfig(tenantId)
    return (config.customFields ?? { contacts: [], companies: [], deals: [] }) as CustomFieldsConfig
  }

  async updateCustomFields(
    tenantId: string,
    updated: CustomFieldsConfig,
    slug: string,
  ): Promise<CustomFieldsConfig> {
    await this.saveConfigSection(tenantId, 'customFields', updated)
    await this.cache.del(`tenant:slug:${slug}`)
    return updated
  }

  async getFieldPermissions(tenantId: string): Promise<FieldPermissionsConfig> {
    const config = await this.getRawConfig(tenantId)
    const raw = config.fieldPermissions
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return raw as FieldPermissionsConfig
    }
    return { contacts: {}, companies: {}, deals: {} }
  }

  async updateFieldPermissions(
    tenantId: string,
    updated: FieldPermissionsConfig,
    slug: string,
  ): Promise<FieldPermissionsConfig> {
    await this.saveConfigSection(tenantId, 'fieldPermissions', updated)
    await this.cache.del(`tenant:slug:${slug}`)
    return updated
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async getRawConfig(tenantId: string): Promise<TenantFullConfig> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } })
    return (tenant?.config ?? {}) as TenantFullConfig
  }

  private async saveConfigSection(
    tenantId: string,
    section: string,
    value: unknown,
  ): Promise<void> {
    const config = await this.getRawConfig(tenantId)
    await this.tenantRepo.update(tenantId, {
      config: { ...config, [section]: value },
    } as Parameters<typeof this.tenantRepo.update>[1])
  }

  private async writeHistory(
    tenantId: string,
    changedBy: string,
    previous: TenantTheme,
  ): Promise<void> {
    await this.historyRepo.save(
      this.historyRepo.create({ tenantId, changedBy, previousConfig: previous }),
    )
    const count = await this.historyRepo.count({ where: { tenantId } })
    if (count > HISTORY_LIMIT) {
      const oldest = await this.historyRepo.find({
        where: { tenantId },
        order: { createdAt: 'ASC' },
        take: count - HISTORY_LIMIT,
      })
      await this.historyRepo.remove(oldest)
    }
  }

  private async invalidateAll(tenantId: string, slug: string): Promise<void> {
    await Promise.all([
      this.cache.del(this.themeKey(tenantId)),
      this.cache.del(this.nomenclatureKey(tenantId)),
      this.cache.del(this.sidebarKey(tenantId)),
      this.cache.del(`tenant:slug:${slug}`),
    ])
  }

  private themeKey(tenantId: string): string {
    return `tenant:theme:${tenantId}`
  }
  private nomenclatureKey(tenantId: string): string {
    return `tenant:nomenclature:${tenantId}`
  }
  private sidebarKey(tenantId: string): string {
    return `tenant:sidebar:${tenantId}`
  }
}

function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target }
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sv = source[key]
    const tv = result[key]
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object') {
      result[key] = deepMerge(
        tv as Record<string, unknown>,
        sv as Record<string, unknown>,
      ) as T[keyof T]
    } else if (sv !== undefined) {
      result[key] = sv as T[keyof T]
    }
  }
  return result
}

function deepMergeTheme(target: TenantTheme, patch: Partial<TenantTheme>): TenantTheme {
  return {
    colors: { ...target.colors, ...patch.colors },
    typography: { ...target.typography, ...patch.typography },
    branding: { ...target.branding, ...patch.branding },
    iconPack: patch.iconPack ?? target.iconPack,
    darkModeDefault: patch.darkModeDefault ?? target.darkModeDefault,
  }
}
