import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { OnboardingStatus, TenantContext } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TenantConfigService } from '../services/tenant-config.service'
import { UpdateOnboardingDto } from '../dto/onboarding-settings.dto'

const ONBOARDING_FINAL_STEP = 6

@ApiTags('Settings - Onboarding')
@Controller('settings/onboarding')
export class OnboardingSettingsController {
  constructor(private readonly configService: TenantConfigService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get current onboarding step and completion status' })
  @ApiOkResponse()
  getOnboarding(@TenantCtx() tenantCtx: TenantContext): Promise<OnboardingStatus> {
    return this.configService.getOnboarding(tenantCtx.tenantId)
  }

  @Patch()
  @Auth(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update onboarding step progress' })
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
