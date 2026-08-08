import { Body, Controller, Get, HttpStatus, Patch } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { OnboardingStatus, TenantContext } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TenantConfigService } from '../services/tenant-config.service'
import { UpdateOnboardingDto } from '../dto/onboarding-settings.dto'

const ONBOARDING_FINAL_STEP = 6

@ApiTags('Settings - Onboarding')
@Controller('settings/onboarding')
export class OnboardingSettingsController {
  constructor(private readonly configService: TenantConfigService) {}

  @Get()
  @ApiEndpoint({
    summary: 'Get current onboarding step and completion status',
    roles: [UserRole.VIEWER],
  })
  @ApiOkResponse()
  getOnboarding(@TenantCtx() tenantCtx: TenantContext): Promise<OnboardingStatus> {
    return this.configService.getOnboarding(tenantCtx.tenantId)
  }

  @Patch()
  @ApiEndpoint({
    summary: 'Update onboarding step progress',
    roles: [UserRole.OWNER],
    status: HttpStatus.OK,
  })
  @ApiOkResponse()
  updateOnboarding(
    @Body() dto: UpdateOnboardingDto,
    @TenantCtx() tenantCtx: TenantContext,
  ): Promise<OnboardingStatus> {
    return this.configService.updateOnboarding(tenantCtx.tenantId, {
      step: dto.step,
      completed: dto.completed ?? dto.step >= ONBOARDING_FINAL_STEP,
    })
  }
}
