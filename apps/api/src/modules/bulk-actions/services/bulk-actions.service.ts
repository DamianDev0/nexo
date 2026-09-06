import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  BULK_EXPORT_FILE_NAME_MAX,
  BULK_EXPORT_FORMATS,
  BULK_REVERTIBLE_KINDS,
  DEFAULT_CONTACT_TAXONOMY,
  activeFieldDefs,
} from '@repo/shared-types'
import type {
  AuthenticatedUser,
  BulkAction,
  BulkActionKind,
  BulkExportFormat,
  ContactTaxonomy,
  CustomFieldsConfig,
  PaginatedBulkActions,
  TenantContext,
} from '@repo/shared-types'
import { DEFAULT_PAGE_SIZE, ROLE_HIERARCHY } from '@repo/shared-utils'
import { EventBusService } from '@/shared/events/event-bus.service'
import {
  AUDIT_EVENTS,
  AuditAction,
  AuditEntityEvent,
  AuditEntityType,
} from '@/shared/events/audit.events'
import {
  BULK_ACTION_ENTITIES,
  BULK_ACTION_MIN_ROLE,
  BULK_CUSTOM_FIELD_PREFIX,
  BULK_MAX_ACTIVE_PER_TENANT,
  BULK_MAX_FILTER_TARGETS,
  BULK_CONTACT_FIELD_SQL,
} from '../constants/bulk-action.constants'
import type { BulkActionQueryDto, CreateBulkActionDto } from '../dto/bulk-action.dto'
import type { BulkActionRow } from '../interfaces/bulk-action-row.interfaces'
import { mapBulkAction } from '../mappers/bulk-action.mapper'
import { BulkActionsRepository } from '../repositories/bulk-actions.repository'
import { BulkSnapshotsRepository } from '../repositories/bulk-snapshots.repository'
import { BulkTargetsRepository } from '../repositories/bulk-targets.repository'
import { BulkActionRunnerService } from './bulk-action-runner.service'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

@Injectable()
export class BulkActionsService {
  constructor(
    private readonly repository: BulkActionsRepository,
    private readonly targets: BulkTargetsRepository,
    private readonly snapshots: BulkSnapshotsRepository,
    private readonly runner: BulkActionRunnerService,
    private readonly eventBus: EventBusService,
  ) {}

  async create(
    ctx: TenantContext,
    user: AuthenticatedUser,
    dto: CreateBulkActionDto,
  ): Promise<BulkAction> {
    this.assertAllowed(user, dto)
    const params = dto.params ?? {}
    this.validateParams(ctx, dto.action, params)

    const active = await this.repository.countActive(ctx.schemaName)
    if (active >= BULK_MAX_ACTIVE_PER_TENANT) {
      throw new BadRequestException(
        `Too many bulk actions in progress (max ${BULK_MAX_ACTIVE_PER_TENANT}); wait for one to finish`,
      )
    }

    const ids = await this.resolveTargets(ctx, dto)
    const row = await this.repository.insert(ctx.schemaName, {
      entity: dto.entity,
      action: dto.action,
      params,
      selectionMode: dto.selection.mode,
      selectionIds: ids,
      selectionQuery: dto.selection.mode === 'filter' ? (dto.selection.query ?? {}) : null,
      total: ids.length,
      drip: dto.drip ?? null,
      createdBy: user.id,
      revertsId: null,
    })

    this.audit(
      ctx.schemaName,
      AuditAction.BulkActionStarted,
      row,
      `Bulk ${row.action} on ${row.entity} queued for ${row.total} records`,
    )
    await this.runner.enqueue({
      bulkActionId: row.id,
      schemaName: ctx.schemaName,
      tenantId: ctx.tenantId,
      tenantSlug: ctx.slug,
    })
    return mapBulkAction(row)
  }

  async revert(ctx: TenantContext, user: AuthenticatedUser, id: string): Promise<BulkAction> {
    const source = await this.fetchOrFail(ctx.schemaName, id)
    this.assertRevertible(source)
    if ((ROLE_HIERARCHY[user.role] ?? 0) < ROLE_HIERARCHY[BULK_ACTION_MIN_ROLE.revert]) {
      throw new ForbiddenException(`Revert requires role ${BULK_ACTION_MIN_ROLE.revert} or higher`)
    }
    const snapshots = await this.snapshots.findByAction(ctx.schemaName, source.id)
    if (snapshots.length === 0)
      throw new BadRequestException('Nothing to revert: no snapshots kept')

    const row = await this.repository.insert(ctx.schemaName, {
      entity: source.entity,
      action: 'revert',
      params: { sourceId: source.id, sourceAction: source.action },
      selectionMode: 'ids',
      selectionIds: snapshots.map((snapshot) => snapshot.entity_id),
      selectionQuery: null,
      total: snapshots.length,
      drip: null,
      createdBy: user.id,
      revertsId: source.id,
    })
    await this.repository.markReverted(ctx.schemaName, source.id)
    this.audit(
      ctx.schemaName,
      AuditAction.BulkActionStarted,
      row,
      `Revert of bulk ${source.action} queued for ${row.total} records`,
    )
    await this.runner.enqueue({
      bulkActionId: row.id,
      schemaName: ctx.schemaName,
      tenantId: ctx.tenantId,
      tenantSlug: ctx.slug,
    })
    return mapBulkAction(row)
  }

  private assertRevertible(source: BulkActionRow): void {
    if (!BULK_REVERTIBLE_KINDS.includes(source.action)) {
      throw new BadRequestException(`Action "${source.action}" cannot be reverted`)
    }
    if (source.status !== 'completed' && source.status !== 'completed_with_errors') {
      throw new BadRequestException('Only finished bulk actions can be reverted')
    }
    if (source.reverted_at) throw new BadRequestException('This bulk action was already reverted')
  }

  async findAll(schemaName: string, query: BulkActionQueryDto): Promise<PaginatedBulkActions> {
    const page = query.page ?? 1
    const limit = query.limit ?? DEFAULT_PAGE_SIZE
    const { rows, total } = await this.repository.findPage(schemaName, {
      entity: query.entity,
      status: query.status,
      createdById: query.createdById,
      page,
      limit,
    })
    return { data: rows.map((row) => mapBulkAction(row)), total, page, limit }
  }

  async findOne(schemaName: string, id: string): Promise<BulkAction> {
    return mapBulkAction(await this.fetchOrFail(schemaName, id))
  }

  async errors(schemaName: string, id: string): Promise<BulkAction['errors']> {
    return (await this.fetchOrFail(schemaName, id)).errors
  }

  async cancel(schemaName: string, id: string, userId: string): Promise<BulkAction> {
    await this.fetchOrFail(schemaName, id)
    const row = await this.repository.transition(
      schemaName,
      id,
      ['queued', 'running', 'paused'],
      'cancelled',
    )
    if (!row)
      throw new BadRequestException('Only queued, running or paused bulk actions can be cancelled')
    this.audit(
      schemaName,
      AuditAction.BulkActionCancelled,
      row,
      `Bulk ${row.action} cancelled`,
      userId,
    )
    return mapBulkAction(row)
  }

  async pause(schemaName: string, id: string): Promise<BulkAction> {
    await this.fetchOrFail(schemaName, id)
    const row = await this.repository.transition(schemaName, id, ['queued', 'running'], 'paused')
    if (!row) throw new BadRequestException('Only queued or running bulk actions can be paused')
    return mapBulkAction(row)
  }

  async resume(ctx: TenantContext, id: string): Promise<BulkAction> {
    const row = await this.fetchOrFail(ctx.schemaName, id)
    if (row.status !== 'paused')
      throw new BadRequestException('Only paused bulk actions can be resumed')
    await this.runner.enqueue({
      bulkActionId: row.id,
      schemaName: ctx.schemaName,
      tenantId: ctx.tenantId,
      tenantSlug: ctx.slug,
    })
    return mapBulkAction(row)
  }

  private async fetchOrFail(schemaName: string, id: string): Promise<BulkActionRow> {
    const row = await this.repository.findById(schemaName, id)
    if (!row) throw new NotFoundException(`Bulk action ${id} not found`)
    return row
  }

  private assertAllowed(user: AuthenticatedUser, dto: CreateBulkActionDto): void {
    if (dto.action === 'revert') {
      throw new BadRequestException('Use POST /bulk-actions/:id/revert to undo a bulk action')
    }
    if (!BULK_ACTION_ENTITIES[dto.action].includes(dto.entity)) {
      throw new BadRequestException(`Action "${dto.action}" is not available for ${dto.entity}`)
    }
    const required = BULK_ACTION_MIN_ROLE[dto.action]
    if ((ROLE_HIERARCHY[user.role] ?? 0) < ROLE_HIERARCHY[required]) {
      throw new ForbiddenException(`Action "${dto.action}" requires role ${required} or higher`)
    }
    if (dto.selection.mode === 'filter' && dto.entity !== 'contacts') {
      throw new BadRequestException('Filter selection is only supported for contacts')
    }
    if (dto.selection.mode === 'ids' && !dto.selection.ids?.length) {
      throw new BadRequestException('selection.ids is required when mode is ids')
    }
    if (dto.drip && !dto.action.startsWith('send_')) {
      throw new BadRequestException('Drip mode only applies to send_* actions')
    }
  }

  private validateParams(
    ctx: TenantContext,
    action: BulkActionKind,
    params: Record<string, unknown>,
  ): void {
    switch (action) {
      case 'add_tags':
      case 'remove_tags':
        this.assertStringList(params['tags'], 'tags')
        return
      case 'assign':
        if (
          typeof params['assignedToId'] !== 'string' ||
          !UUID_PATTERN.test(params['assignedToId'])
        ) {
          throw new BadRequestException('params.assignedToId must be a user UUID')
        }
        return
      case 'update_field':
        this.validateFieldUpdate(ctx, params)
        return
      case 'send_email':
      case 'send_sms':
      case 'send_whatsapp':
        if (typeof params['templateId'] !== 'string' || !UUID_PATTERN.test(params['templateId'])) {
          throw new BadRequestException('params.templateId must be a message template UUID')
        }
        return
      case 'export':
        this.validateExport(params)
        return
      case 'archive':
      case 'restore':
      case 'revert':
        return
    }
  }

  private validateExport(params: Record<string, unknown>): void {
    if (params['columns'] !== undefined) this.assertStringList(params['columns'], 'columns')
    const format = params['format']
    if (format !== undefined && !BULK_EXPORT_FORMATS.includes(format as BulkExportFormat)) {
      throw new BadRequestException(
        `params.format must be one of: ${BULK_EXPORT_FORMATS.join(', ')}`,
      )
    }
    const fileName = params['fileName']
    if (fileName === undefined) return
    if (
      typeof fileName !== 'string' ||
      fileName.trim().length === 0 ||
      fileName.length > BULK_EXPORT_FILE_NAME_MAX
    ) {
      throw new BadRequestException(
        `params.fileName must be a non-empty string up to ${BULK_EXPORT_FILE_NAME_MAX} characters`,
      )
    }
  }

  private validateFieldUpdate(ctx: TenantContext, params: Record<string, unknown>): void {
    const field = params['field']
    if (typeof field !== 'string') throw new BadRequestException('params.field is required')
    const value = params['value']

    if (field.startsWith(BULK_CUSTOM_FIELD_PREFIX)) {
      const key = field.slice(BULK_CUSTOM_FIELD_PREFIX.length)
      const config = ctx.config['customFields'] as CustomFieldsConfig | undefined
      const def = activeFieldDefs(config?.contacts ?? []).find((candidate) => candidate.key === key)
      if (!def) throw new BadRequestException(`Unknown custom field "${key}"`)
      return
    }

    if (!BULK_CONTACT_FIELD_SQL[field]) {
      throw new BadRequestException(
        `Field "${field}" cannot be bulk-updated. Allowed: ${Object.keys(BULK_CONTACT_FIELD_SQL).join(', ')}`,
      )
    }
    const taxonomy =
      (ctx.config['contactTaxonomy'] as ContactTaxonomy | undefined) ?? DEFAULT_CONTACT_TAXONOMY
    const options =
      {
        status: taxonomy.statuses,
        lifecycleStage: taxonomy.lifecycleStages,
        source: taxonomy.sources,
      }[field] ?? []
    if (
      typeof value !== 'string' ||
      !options.some((option) => option.enabled && option.key === value)
    ) {
      throw new BadRequestException(
        `params.value "${String(value)}" is not an enabled ${field} option`,
      )
    }
  }

  private assertStringList(value: unknown, name: string): void {
    if (
      !Array.isArray(value) ||
      value.length === 0 ||
      !value.every((item) => typeof item === 'string' && item.length > 0)
    ) {
      throw new BadRequestException(`params.${name} must be a non-empty list of strings`)
    }
  }

  private async resolveTargets(ctx: TenantContext, dto: CreateBulkActionDto): Promise<string[]> {
    if (dto.selection.mode === 'ids') return [...new Set(dto.selection.ids ?? [])]
    const ids = await this.targets.resolveContactIds(
      ctx.schemaName,
      dto.selection.query ?? {},
      BULK_MAX_FILTER_TARGETS,
    )
    if (ids.length > BULK_MAX_FILTER_TARGETS) {
      throw new BadRequestException(
        `Filter matches more than ${BULK_MAX_FILTER_TARGETS} records; narrow it down`,
      )
    }
    if (ids.length === 0) throw new BadRequestException('Filter matches no records')
    return ids
  }

  private audit(
    schemaName: string,
    action: AuditAction,
    row: BulkActionRow,
    description: string,
    userId: string = row.created_by,
  ): void {
    this.eventBus.emit(
      AUDIT_EVENTS.ENTITY,
      new AuditEntityEvent(
        schemaName,
        action,
        AuditEntityType.BulkAction,
        row.id,
        userId,
        description,
      ),
    )
  }
}
