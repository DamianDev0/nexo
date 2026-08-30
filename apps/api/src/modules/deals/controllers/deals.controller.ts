import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  DealDetail,
  DealItem,
  ForecastEntry,
  PaginatedDeals,
  TenantContext,
  AuthenticatedUser,
} from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { DealsService } from '../services/deals.service'
import { DealItemsService } from '../services/deal-items.service'
import { DealForecastService } from '../services/deal-forecast.service'
import { CUSTOM_FIELDS_VALIDATOR } from '../constants/deal.constants'
import type { CustomFieldsValidatorPort } from '../interfaces/custom-fields-validator.port'
import {
  CreateDealDto,
  CreateDealItemDto,
  DealQueryDto,
  LoseDealDto,
  MoveDealDto,
  UpdateDealDto,
  UpdateDealItemDto,
} from '../dto/deal.dto'

@ApiTags('Deals')
@Controller('deals')
export class DealsController {
  constructor(
    private readonly dealsService: DealsService,
    private readonly dealItemsService: DealItemsService,
    private readonly dealForecastService: DealForecastService,
    @Inject(CUSTOM_FIELDS_VALIDATOR) private readonly customFields: CustomFieldsValidatorPort,
  ) {}

  @Get()
  @ApiEndpoint({ summary: 'List deals with pagination and filters', roles: [UserRole.VIEWER] })
  findAll(@TenantCtx() ctx: TenantContext, @Query() query: DealQueryDto): Promise<PaginatedDeals> {
    return this.dealsService.findAll(ctx.schemaName, query)
  }

  @Post()
  @ApiEndpoint({ summary: 'Create a deal', roles: [UserRole.SALES_REP] })
  async create(
    @Body() dto: CreateDealDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealDetail> {
    await this.customFields.validate(ctx.tenantId, 'deals', dto.customFields)
    return this.dealsService.create(ctx.schemaName, dto, user.id)
  }

  @Get('forecast')
  @ApiEndpoint({
    summary: 'Forecast: weighted deal value by month for the next N months',
    roles: [UserRole.VIEWER],
  })
  getForecast(@TenantCtx() ctx: TenantContext): Promise<ForecastEntry[]> {
    return this.dealForecastService.getForecast(ctx.schemaName)
  }

  @Get(':id')
  @ApiEndpoint({
    summary: 'Get deal with full relations and items',
    roles: [UserRole.VIEWER],
    param: 'Deal UUID',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealDetail> {
    return this.dealsService.findOne(ctx.schemaName, id)
  }

  @Patch(':id')
  @ApiEndpoint({ summary: 'Update a deal', roles: [UserRole.SALES_REP], param: 'Deal UUID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDealDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealDetail> {
    await this.customFields.validate(ctx.tenantId, 'deals', dto.customFields, 'update')
    return this.dealsService.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Soft-delete a deal',
    roles: [UserRole.MANAGER],
    param: 'Deal UUID',
    status: HttpStatus.NO_CONTENT,
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.dealsService.remove(ctx.schemaName, id)
  }

  @Patch(':id/stage')
  @ApiEndpoint({
    summary: 'Move deal to a different pipeline stage (kanban drag)',
    roles: [UserRole.SALES_REP],
    param: 'Deal UUID',
  })
  moveStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveDealDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealDetail> {
    return this.dealsService.moveStage(ctx.schemaName, id, dto, user.id)
  }

  @Patch(':id/won')
  @ApiEndpoint({
    summary: 'Mark a deal as won (must be open)',
    roles: [UserRole.SALES_REP],
    param: 'Deal UUID',
  })
  markWon(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealDetail> {
    return this.dealsService.markWon(ctx.schemaName, id, user.id)
  }

  @Patch(':id/lost')
  @ApiEndpoint({
    summary: 'Mark a deal as lost with required loss reason (must be open)',
    roles: [UserRole.SALES_REP],
    param: 'Deal UUID',
  })
  markLost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LoseDealDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealDetail> {
    return this.dealsService.markLost(ctx.schemaName, id, dto, user.id)
  }

  @Patch(':id/reopen')
  @ApiEndpoint({
    summary: 'Reopen a won or lost deal',
    roles: [UserRole.SALES_REP],
    param: 'Deal UUID',
  })
  reopen(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealDetail> {
    return this.dealsService.reopen(ctx.schemaName, id, user.id)
  }

  @Get(':id/items')
  @ApiEndpoint({ summary: 'List items of a deal', roles: [UserRole.VIEWER], param: 'Deal UUID' })
  getItems(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealItem[]> {
    return this.dealItemsService.getItems(ctx.schemaName, id)
  }

  @Post(':id/items')
  @ApiEndpoint({
    summary: 'Add an item to a deal (auto-recalculates deal value)',
    roles: [UserRole.SALES_REP],
    param: 'Deal UUID',
  })
  addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateDealItemDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealItem> {
    return this.dealItemsService.addItem(ctx.schemaName, id, dto)
  }

  @Patch(':id/items/:itemId')
  @ApiEndpoint({
    summary: 'Update a deal item (auto-recalculates deal value)',
    roles: [UserRole.SALES_REP],
    param: 'Deal UUID',
  })
  @ApiParam({ name: 'itemId', description: 'Item UUID' })
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateDealItemDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealItem> {
    return this.dealItemsService.updateItem(ctx.schemaName, id, itemId, dto)
  }

  @Delete(':id/items/:itemId')
  @ApiEndpoint({
    summary: 'Remove an item from a deal (auto-recalculates deal value)',
    roles: [UserRole.SALES_REP],
    param: 'Deal UUID',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'itemId', description: 'Item UUID' })
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<void> {
    return this.dealItemsService.removeItem(ctx.schemaName, id, itemId)
  }
}
