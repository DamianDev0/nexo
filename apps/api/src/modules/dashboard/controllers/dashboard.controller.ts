import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  AuthenticatedUser,
  DashboardData,
  DashboardLayout,
  DashboardMetrics,
  OverdueInvoice,
  PipelineSummary,
  RevenueByMonth,
  UserDashboardConfig,
  TenantContext,
  TodayActivity,
  TopSalesRep,
} from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ReorderWidgetsDto, ToggleWidgetDto } from '../dto/dashboard-config.dto'
import { DashboardService } from '../services/dashboard.service'
import { DashboardConfigService } from '../services/dashboard-config.service'

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly dashboardConfigService: DashboardConfigService,
  ) {}

  @Get()
  @ApiEndpoint({ summary: 'Get full dashboard data in a single request', roles: [UserRole.VIEWER] })
  async getAll(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DashboardData> {
    const [
      metrics,
      pipelineSummary,
      todayActivities,
      overdueInvoices,
      topSalesReps,
      revenueByMonth,
    ] = await Promise.all([
      this.dashboardService.getMetrics(ctx.schemaName, ctx.tenantId),
      this.dashboardService.getPipelineSummary(ctx.schemaName),
      this.dashboardService.getTodayActivities(ctx.schemaName, user.id),
      this.dashboardService.getOverdueInvoices(ctx.schemaName),
      this.dashboardService.getTopSalesReps(ctx.schemaName),
      this.dashboardService.getRevenueByMonth(ctx.schemaName),
    ])

    return {
      metrics,
      pipelineSummary,
      todayActivities,
      overdueInvoices,
      topSalesReps,
      revenueByMonth,
    }
  }

  @Get('metrics')
  @ApiEndpoint({
    summary: 'KPI cards: receivable, overdue, active deals, invoiced this month',
    roles: [UserRole.VIEWER],
  })
  getMetrics(@TenantCtx() ctx: TenantContext): Promise<DashboardMetrics> {
    return this.dashboardService.getMetrics(ctx.schemaName, ctx.tenantId)
  }

  @Get('pipeline-summary')
  @ApiEndpoint({
    summary: 'Deal count and value grouped by pipeline stage',
    roles: [UserRole.VIEWER],
  })
  getPipelineSummary(@TenantCtx() ctx: TenantContext): Promise<PipelineSummary[]> {
    return this.dashboardService.getPipelineSummary(ctx.schemaName)
  }

  @Get('today-activities')
  @ApiEndpoint({
    summary: 'Pending activities for today for the current user',
    roles: [UserRole.VIEWER],
  })
  getTodayActivities(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TodayActivity[]> {
    return this.dashboardService.getTodayActivities(ctx.schemaName, user.id)
  }

  @Get('overdue-invoices')
  @ApiEndpoint({
    summary: 'Top overdue invoices sorted by oldest first',
    roles: [UserRole.VIEWER],
  })
  getOverdueInvoices(@TenantCtx() ctx: TenantContext): Promise<OverdueInvoice[]> {
    return this.dashboardService.getOverdueInvoices(ctx.schemaName)
  }

  @Get('top-sales-reps')
  @ApiEndpoint({
    summary: 'Top performing sales reps by won deals this month',
    roles: [UserRole.VIEWER],
  })
  getTopSalesReps(@TenantCtx() ctx: TenantContext): Promise<TopSalesRep[]> {
    return this.dashboardService.getTopSalesReps(ctx.schemaName)
  }

  @Get('revenue-by-month')
  @ApiEndpoint({
    summary: 'Revenue trend: invoiced and paid by month for the last 6 months',
    roles: [UserRole.VIEWER],
  })
  getRevenueByMonth(
    @TenantCtx() ctx: TenantContext,
    @Query('months') months?: string,
  ): Promise<RevenueByMonth[]> {
    return this.dashboardService.getRevenueByMonth(ctx.schemaName, months ? Number(months) : 6)
  }

  @Get('config')
  @ApiEndpoint({
    summary: 'Get dashboard layout config for the current user',
    roles: [UserRole.VIEWER],
  })
  getConfig(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserDashboardConfig> {
    return this.dashboardConfigService.getConfig(ctx.schemaName, user.id)
  }

  @Patch('config')
  @ApiEndpoint({
    summary: 'Update full dashboard layout (widgets, columns, refresh interval)',
    roles: [UserRole.VIEWER],
  })
  updateConfig(
    @Body() layout: DashboardLayout,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserDashboardConfig> {
    return this.dashboardConfigService.updateLayout(ctx.schemaName, user.id, layout)
  }

  @Patch('config/toggle-widget')
  @ApiEndpoint({ summary: 'Toggle a widget visible/hidden', roles: [UserRole.VIEWER] })
  toggleWidget(
    @Body() dto: ToggleWidgetDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserDashboardConfig> {
    return this.dashboardConfigService.toggleWidget(
      ctx.schemaName,
      user.id,
      dto.widgetId,
      dto.visible,
    )
  }

  @Patch('config/reorder')
  @ApiEndpoint({
    summary: 'Reorder widgets by passing array of widget IDs in desired order',
    roles: [UserRole.VIEWER],
  })
  reorderWidgets(
    @Body() dto: ReorderWidgetsDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserDashboardConfig> {
    return this.dashboardConfigService.reorderWidgets(ctx.schemaName, user.id, dto.widgetIds)
  }

  @Post('config/reset')
  @ApiEndpoint({ summary: 'Reset dashboard to default layout', roles: [UserRole.VIEWER] })
  resetConfig(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserDashboardConfig> {
    return this.dashboardConfigService.resetToDefault(ctx.schemaName, user.id)
  }
}
