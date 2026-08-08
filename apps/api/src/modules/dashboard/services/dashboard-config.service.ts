import { Injectable } from '@nestjs/common'
import type { DashboardLayout, DashboardWidget, UserDashboardConfig } from '@repo/shared-types'
import { DashboardConfigRepository } from '../repositories/dashboard-config.repository'
import { mapConfig } from '../mappers/dashboard-config.mapper'
import { DEFAULT_LAYOUT } from '../constants/default-dashboard-layout'

@Injectable()
export class DashboardConfigService {
  constructor(private readonly repo: DashboardConfigRepository) {}

  async getConfig(schemaName: string, userId: string): Promise<UserDashboardConfig> {
    const row = await this.repo.findOrCreate(schemaName, userId, DEFAULT_LAYOUT)
    return mapConfig(row)
  }

  async updateLayout(
    schemaName: string,
    userId: string,
    layout: DashboardLayout,
  ): Promise<UserDashboardConfig> {
    await this.getConfig(schemaName, userId)
    const row = await this.repo.updateLayout(schemaName, userId, layout)
    return mapConfig(row)
  }

  async toggleWidget(
    schemaName: string,
    userId: string,
    widgetId: string,
    visible: boolean,
  ): Promise<UserDashboardConfig> {
    const config = await this.getConfig(schemaName, userId)
    const widget = config.layout.widgets.find((w) => w.id === widgetId)
    if (widget) widget.visible = visible
    return this.updateLayout(schemaName, userId, config.layout)
  }

  async reorderWidgets(
    schemaName: string,
    userId: string,
    widgetIds: string[],
  ): Promise<UserDashboardConfig> {
    const config = await this.getConfig(schemaName, userId)
    const widgetMap = new Map(config.layout.widgets.map((w) => [w.id, w]))

    config.layout.widgets = widgetIds
      .map((id, i) => {
        const w = widgetMap.get(id)
        if (w) w.position = i
        return w
      })
      .filter((w): w is DashboardWidget => w !== undefined)

    const remaining = config.layout.widgets
      .filter((w) => !widgetIds.includes(w.id))
      .map((w, i) => ({ ...w, position: widgetIds.length + i }))

    config.layout.widgets = [...config.layout.widgets, ...remaining]
    return this.updateLayout(schemaName, userId, config.layout)
  }

  async resetToDefault(schemaName: string, userId: string): Promise<UserDashboardConfig> {
    return this.updateLayout(schemaName, userId, DEFAULT_LAYOUT)
  }
}
