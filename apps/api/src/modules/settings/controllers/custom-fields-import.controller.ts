import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { CustomFieldHeaderAnalysis, TenantContext } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CustomFieldsImportService } from '../services/custom-fields-import.service'
import { assertValidEntity, VALID_ENTITIES } from '../constants/custom-field-entities'

@ApiTags('Settings – Custom Fields')
@Controller('settings/custom-fields')
export class CustomFieldsImportController {
  constructor(private readonly importService: CustomFieldsImportService) {}

  @Post(':entity/analyze-headers')
  @ApiEndpoint({
    summary: 'Analyze spreadsheet headers and suggest custom field definitions',
    roles: [UserRole.ADMIN],
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  async analyzeHeaders(
    @Param('entity') entity: string,
    @UploadedFile() file: Express.Multer.File,
    @TenantCtx() ctx: TenantContext,
  ): Promise<CustomFieldHeaderAnalysis> {
    assertValidEntity(entity)
    if (!file) throw new BadRequestException('Missing file')
    return this.importService.analyzeHeaders(ctx.tenantId, entity, file)
  }
}
