import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
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
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { DashboardService } from './dashboard.service'
import { DashboardConfigService } from './dashboard-config.service'

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly dashboardConfigService: DashboardConfigService,
  ) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get full dashboard data in a single request' })
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
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'KPI cards: receivable, overdue, active deals, invoiced this month' })
  getMetrics(@TenantCtx() ctx: TenantContext): Promise<DashboardMetrics> {
    return this.dashboardService.getMetrics(ctx.schemaName, ctx.tenantId)
  }

  @Get('pipeline-summary')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Deal count and value grouped by pipeline stage' })
  getPipelineSummary(@TenantCtx() ctx: TenantContext): Promise<PipelineSummary[]> {
    return this.dashboardService.getPipelineSummary(ctx.schemaName)
  }

  @Get('today-activities')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Pending activities for today for the current user' })
  getTodayActivities(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TodayActivity[]> {
    return this.dashboardService.getTodayActivities(ctx.schemaName, user.id)
  }

  @Get('overdue-invoices')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Top overdue invoices sorted by oldest first' })
  getOverdueInvoices(@TenantCtx() ctx: TenantContext): Promise<OverdueInvoice[]> {
    return this.dashboardService.getOverdueInvoices(ctx.schemaName)
  }

  @Get('top-sales-reps')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Top performing sales reps by won deals this month' })
  getTopSalesReps(@TenantCtx() ctx: TenantContext): Promise<TopSalesRep[]> {
    return this.dashboardService.getTopSalesReps(ctx.schemaName)
  }

  @Get('revenue-by-month')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Revenue trend: invoiced and paid by month for the last 6 months' })
  getRevenueByMonth(
    @TenantCtx() ctx: TenantContext,
    @Query('months') months?: string,
  ): Promise<RevenueByMonth[]> {
    return this.dashboardService.getRevenueByMonth(ctx.schemaName, months ? Number(months) : 6)
  }

  @Get('config')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get dashboard layout config for the current user' })
  getConfig(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserDashboardConfig> {
    return this.dashboardConfigService.getConfig(ctx.schemaName, user.id)
  }

  @Patch('config')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Update full dashboard layout (widgets, columns, refresh interval)' })
  updateConfig(
    @Body() layout: DashboardLayout,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserDashboardConfig> {
    return this.dashboardConfigService.updateLayout(ctx.schemaName, user.id, layout)
  }

  @Patch('config/toggle-widget')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Toggle a widget visible/hidden' })
  toggleWidget(
    @Body() dto: { widgetId: string; visible: boolean },
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
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Reorder widgets by passing array of widget IDs in desired order' })
  reorderWidgets(
    @Body() dto: { widgetIds: string[] },
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserDashboardConfig> {
    return this.dashboardConfigService.reorderWidgets(ctx.schemaName, user.id, dto.widgetIds)
  }

  @Post('config/reset')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Reset dashboard to default layout' })
  resetConfig(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserDashboardConfig> {
    return this.dashboardConfigService.resetToDefault(ctx.schemaName, user.id)
  }
}
