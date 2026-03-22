import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { UpdateOnboardingDto } from '../dto/onboarding-settings.dto'
import type { TenantConfig, OnboardingConfig } from '../interfaces/settings.interface'

@ApiTags('Settings - Onboarding')
@Controller('settings/onboarding')
export class OnboardingSettingsController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get current onboarding step and completion status' })
  @ApiOkResponse()
  async getOnboarding(@TenantCtx() tenantCtx: TenantContext): Promise<OnboardingConfig> {
    const tenant = await this.tenantRepo.findOneOrFail({ where: { id: tenantCtx.tenantId } })
    const config = (tenant.config ?? {}) as TenantConfig
    return config.onboarding ?? { step: 1, completed: false }
  }

  @Patch()
  @Auth(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update onboarding step progress' })
  @ApiOkResponse()
  async updateOnboarding(
    @Body() dto: UpdateOnboardingDto,
    @TenantCtx() tenantCtx: TenantContext,
  ): Promise<OnboardingConfig> {
    const tenant = await this.tenantRepo.findOneOrFail({ where: { id: tenantCtx.tenantId } })
    const config = (tenant.config ?? {}) as TenantConfig

    const onboarding: OnboardingConfig = {
      step: dto.step,
      completed: dto.completed ?? dto.step >= 6,
    }

    const newConfig = { ...config, onboarding }
    await this.tenantRepo.update(tenantCtx.tenantId, {
      config: newConfig,
    } as Parameters<typeof this.tenantRepo.update>[1])

    return onboarding
  }
}
