import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  DealDetail,
  DealItem,
  ForecastEntry,
  PaginatedDeals,
  TenantContext,
  AuthenticatedUser,
} from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { DealsService } from './deals.service'
import {
  CreateDealDto,
  CreateDealItemDto,
  DealQueryDto,
  LoseDealDto,
  MoveDealDto,
  UpdateDealDto,
  UpdateDealItemDto,
} from './dto/deal.dto'

@ApiTags('Deals')
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  //  CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List deals with pagination and filters' })
  findAll(@TenantCtx() ctx: TenantContext, @Query() query: DealQueryDto): Promise<PaginatedDeals> {
    return this.dealsService.findAll(ctx.schemaName, query)
  }

  @Post()
  @Auth(UserRole.SALES_REP)
  @ApiOperation({ summary: 'Create a deal' })
  create(
    @Body() dto: CreateDealDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealDetail> {
    return this.dealsService.create(ctx.schemaName, dto, user.id)
  }

  @Get('forecast')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Forecast: weighted deal value by month for the next N months' })
  getForecast(@TenantCtx() ctx: TenantContext): Promise<ForecastEntry[]> {
    return this.dealsService.getForecast(ctx.schemaName)
  }

  @Get(':id')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Get deal with full relations and items' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealDetail> {
    return this.dealsService.findOne(ctx.schemaName, id)
  }

  @Patch(':id')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Update a deal' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDealDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealDetail> {
    return this.dealsService.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @Auth(UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Soft-delete a deal' })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.dealsService.remove(ctx.schemaName, id)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  Status transitions
  // ═══════════════════════════════════════════════════════════════════════════

  @Patch(':id/stage')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Move deal to a different pipeline stage (kanban drag)' })
  moveStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveDealDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealDetail> {
    return this.dealsService.moveStage(ctx.schemaName, id, dto, user.id)
  }

  @Patch(':id/won')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Mark a deal as won (must be open)' })
  markWon(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealDetail> {
    return this.dealsService.markWon(ctx.schemaName, id, user.id)
  }

  @Patch(':id/lost')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Mark a deal as lost with required loss reason (must be open)' })
  markLost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LoseDealDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealDetail> {
    return this.dealsService.markLost(ctx.schemaName, id, dto, user.id)
  }

  @Patch(':id/reopen')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Reopen a won or lost deal' })
  reopen(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealDetail> {
    return this.dealsService.reopen(ctx.schemaName, id, user.id)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  Deal Items
  // ═══════════════════════════════════════════════════════════════════════════

  @Get(':id/items')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'List items of a deal' })
  getItems(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealItem[]> {
    return this.dealsService.getItems(ctx.schemaName, id)
  }

  @Post(':id/items')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Add an item to a deal (auto-recalculates deal value)' })
  addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateDealItemDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealItem> {
    return this.dealsService.addItem(ctx.schemaName, id, dto)
  }

  @Patch(':id/items/:itemId')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiParam({ name: 'itemId', description: 'Item UUID' })
  @ApiOperation({ summary: 'Update a deal item (auto-recalculates deal value)' })
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateDealItemDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealItem> {
    return this.dealsService.updateItem(ctx.schemaName, id, itemId, dto)
  }

  @Delete(':id/items/:itemId')
  @Auth(UserRole.SALES_REP)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiParam({ name: 'itemId', description: 'Item UUID' })
  @ApiOperation({ summary: 'Remove an item from a deal (auto-recalculates deal value)' })
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<void> {
    return this.dealsService.removeItem(ctx.schemaName, id, itemId)
  }
}
