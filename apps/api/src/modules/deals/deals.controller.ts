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
  DealQueryDto,
  LoseDealDto,
  MoveDealDto,
  UpdateDealDto,
} from './dto/deal.dto'

@ApiTags('Deals')
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  // ─── List ─────────────────────────────────────────────────────────────────

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List deals with pagination and filters' })
  findAll(@TenantCtx() ctx: TenantContext, @Query() query: DealQueryDto): Promise<PaginatedDeals> {
    return this.dealsService.findAll(ctx.schemaName, query)
  }

  // ─── Create ───────────────────────────────────────────────────────────────

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

  // ─── Find one ─────────────────────────────────────────────────────────────

  @Get(':id')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Get a deal with full contact, company and stage info' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealDetail> {
    return this.dealsService.findOne(ctx.schemaName, id)
  }

  // ─── Update ───────────────────────────────────────────────────────────────

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

  // ─── Delete ───────────────────────────────────────────────────────────────

  @Delete(':id')
  @Auth(UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Soft-delete a deal' })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.dealsService.remove(ctx.schemaName, id)
  }

  // ─── Move to stage ────────────────────────────────────────────────────────

  @Patch(':id/stage')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Move deal to a different pipeline stage (kanban drag)' })
  moveStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveDealDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealDetail> {
    return this.dealsService.moveStage(ctx.schemaName, id, dto)
  }

  // ─── Mark won ─────────────────────────────────────────────────────────────

  @Patch(':id/won')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Mark a deal as won' })
  markWon(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealDetail> {
    return this.dealsService.markWon(ctx.schemaName, id)
  }

  // ─── Mark lost ────────────────────────────────────────────────────────────

  @Patch(':id/lost')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Mark a deal as lost with optional loss reason' })
  markLost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LoseDealDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealDetail> {
    return this.dealsService.markLost(ctx.schemaName, id, dto)
  }

  // ─── Reopen ───────────────────────────────────────────────────────────────

  @Patch(':id/reopen')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Reopen a won or lost deal (set status back to open)' })
  reopen(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DealDetail> {
    return this.dealsService.reopen(ctx.schemaName, id)
  }
}
