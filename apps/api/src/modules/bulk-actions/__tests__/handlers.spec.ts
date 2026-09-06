jest.mock('uuid', () => ({ v4: jest.fn(() => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee') }))
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}))
jest.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: jest.fn() }))

import { Test } from '@nestjs/testing'
import ExcelJS from 'exceljs'
import { getQueueToken } from '@nestjs/bullmq'
import { QUEUE_NAMES } from '@/shared/queue/queue-names'
import { type S3Service } from '@/shared/integrations/aws/s3.service'
import { TagsHandler } from '../handlers/tags.handler'
import { UpdateFieldHandler } from '../handlers/update-field.handler'
import { SendMessageHandler } from '../handlers/send-message.handler'
import { ExportHandler, exportFileName } from '../handlers/export.handler'
import { toCsv, toJson, toXlsx } from '../mappers/export-file.mapper'
import { RevertHandler } from '../handlers/revert.handler'
import { type BulkSnapshotsRepository } from '../repositories/bulk-snapshots.repository'
import { outcomeFromReturnedIds } from '../handlers/bulk-action-handler.interface'
import { BulkTargetsRepository } from '../repositories/bulk-targets.repository'
import { type BulkActionsRepository } from '../repositories/bulk-actions.repository'
import type { BulkActionRow, BulkRunContext } from '../interfaces/bulk-action-row.interfaces'

function ctx(overrides: Partial<BulkActionRow> = {}): BulkRunContext {
  return {
    schemaName: 'tenant_acme',
    tenantId: 'tenant-1',
    tenantSlug: 'acme',
    action: {
      id: 'ba-1',
      entity: 'contacts',
      action: 'add_tags',
      params: { tags: ['vip'] },
      selection_mode: 'ids',
      selection_ids: ['a', 'b'],
      selection_query: null,
      status: 'running',
      total: 2,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [],
      result_file_url: null,
      drip: null,
      job_id: null,
      reverted_at: null,
      reverts_id: null,
      created_by: 'user-1',
      started_at: null,
      finished_at: null,
      created_at: '2026-09-05T00:00:00Z',
      updated_at: '2026-09-05T00:00:00Z',
      ...overrides,
    },
  }
}

describe('outcomeFromReturnedIds', () => {
  it('marks ids the UPDATE did not return as not_found', () => {
    expect(outcomeFromReturnedIds(['a', 'b', 'c'], ['a', 'c'])).toEqual({
      succeeded: ['a', 'c'],
      errors: [{ id: 'b', message: 'not_found' }],
    })
  })
})

describe('TagsHandler', () => {
  it('routes add and remove to the matching repository call', async () => {
    const targets = {
      addTags: jest.fn().mockResolvedValue(['a']),
      removeTags: jest.fn().mockResolvedValue(['a', 'b']),
    }
    const handler = new TagsHandler(targets as unknown as BulkTargetsRepository)

    await expect(handler.run(ctx(), ['a', 'b'])).resolves.toEqual({
      succeeded: ['a'],
      errors: [{ id: 'b', message: 'not_found' }],
    })
    expect(targets.addTags).toHaveBeenCalledWith('tenant_acme', 'contacts', ['a', 'b'], ['vip'])

    await handler.run(ctx({ action: 'remove_tags' }), ['a', 'b'])
    expect(targets.removeTags).toHaveBeenCalledWith('tenant_acme', 'contacts', ['a', 'b'], ['vip'])
  })
})

describe('UpdateFieldHandler', () => {
  it('writes core columns and custom fields through different paths', async () => {
    const targets = {
      updateContactColumn: jest.fn().mockResolvedValue(['a']),
      updateContactCustomField: jest.fn().mockResolvedValue(['a']),
    }
    const handler = new UpdateFieldHandler(targets as unknown as BulkTargetsRepository)

    await handler.run(
      ctx({ action: 'update_field', params: { field: 'status', value: 'client' } }),
      ['a'],
    )
    expect(targets.updateContactColumn).toHaveBeenCalledWith(
      'tenant_acme',
      ['a'],
      'status',
      'client',
    )

    await handler.run(
      ctx({ action: 'update_field', params: { field: 'custom:eps', value: 'Sura' } }),
      ['a'],
    )
    expect(targets.updateContactCustomField).toHaveBeenCalledWith(
      'tenant_acme',
      ['a'],
      'eps',
      'Sura',
    )
  })
})

describe('SendMessageHandler', () => {
  it('skips opted-out and unreachable contacts and queues rendered messages for the rest', async () => {
    const targets = {
      findMessageTemplate: jest.fn().mockResolvedValue({
        id: 't-1',
        channel: 'whatsapp',
        format: 'text',
        subject: null,
        body: 'Hola {{firstName}}, {{promo}}',
      }),
      findRecipients: jest.fn().mockResolvedValue([
        {
          id: 'a',
          first_name: 'Ana',
          last_name: 'Rojas',
          email: null,
          phone: '3001',
          whatsapp: null,
          opted_out: false,
        },
        {
          id: 'b',
          first_name: 'Beto',
          last_name: null,
          email: null,
          phone: '3002',
          whatsapp: '3002',
          opted_out: true,
        },
        {
          id: 'c',
          first_name: 'Caro',
          last_name: null,
          email: null,
          phone: null,
          whatsapp: null,
          opted_out: false,
        },
      ]),
    }
    const queue = { addBulk: jest.fn() }
    const module = await Test.createTestingModule({
      providers: [
        SendMessageHandler,
        { provide: BulkTargetsRepository, useValue: targets },
        { provide: getQueueToken(QUEUE_NAMES.MESSAGES), useValue: queue },
      ],
    }).compile()
    const handler = module.get(SendMessageHandler)

    const outcome = await handler.run(
      ctx({
        action: 'send_whatsapp',
        params: { templateId: 't-1', variables: { promo: '20% off' } },
      }),
      ['a', 'b', 'c', 'd'],
    )

    expect(outcome.succeeded).toEqual(['a'])
    expect(outcome.errors).toEqual([
      { id: 'b', message: 'no_consent' },
      { id: 'c', message: 'no_recipient' },
      { id: 'd', message: 'not_found' },
    ])
    expect(targets.findRecipients).toHaveBeenCalledWith(
      'tenant_acme',
      ['a', 'b', 'c', 'd'],
      'whatsapp',
    )
    expect(queue.addBulk).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'send-whatsapp',
        data: expect.objectContaining({ recipient: '3001', renderedBody: 'Hola Ana, 20% off' }),
      }),
    ])
  })

  it('fails the whole batch when the template is gone', async () => {
    const targets = {
      findMessageTemplate: jest.fn().mockResolvedValue(null),
      findRecipients: jest.fn(),
    }
    const queue = { addBulk: jest.fn() }
    const module = await Test.createTestingModule({
      providers: [
        SendMessageHandler,
        { provide: BulkTargetsRepository, useValue: targets },
        { provide: getQueueToken(QUEUE_NAMES.MESSAGES), useValue: queue },
      ],
    }).compile()

    const outcome = await module
      .get(SendMessageHandler)
      .run(ctx({ action: 'send_email', params: { templateId: 't-x' } }), ['a'])

    expect(outcome).toEqual({ succeeded: [], errors: [{ id: 'a', message: 'template_not_found' }] })
    expect(queue.addBulk).not.toHaveBeenCalled()
  })
})

describe('ExportHandler', () => {
  it('escapes CSV cells and drops internal columns', () => {
    const csv = toCsv([
      { id: '1', first_name: 'Ana, "la jefa"', tags: ['vip'], is_active: true, score: 10 },
    ])
    expect(csv).toBe('id,first_name,tags,score\n1,"Ana, ""la jefa""","[""vip""]",10')
  })

  it('uploads one CSV when the last batch lands and stores a presigned url', async () => {
    const targets = {
      findRowsForExport: jest
        .fn()
        .mockResolvedValueOnce([{ id: 'a', first_name: 'Ana' }])
        .mockResolvedValueOnce([{ id: 'b', first_name: 'Beto' }]),
    }
    const actions = { setResultFile: jest.fn() }
    const s3 = {
      upload: jest.fn().mockResolvedValue({ key: 'acme/exports/x.csv', url: 'u' }),
      presignedUrl: jest.fn().mockResolvedValue('https://signed'),
    }
    const handler = new ExportHandler(
      targets as unknown as BulkTargetsRepository,
      actions as unknown as BulkActionsRepository,
      s3 as unknown as S3Service,
    )

    await handler.run(ctx({ action: 'export', params: {}, total: 2, processed: 0 }), ['a'])
    expect(s3.upload).not.toHaveBeenCalled()

    const outcome = await handler.run(
      ctx({ action: 'export', params: {}, total: 2, processed: 1 }),
      ['b'],
    )

    expect(outcome.succeeded).toEqual(['b'])
    const file = s3.upload.mock.calls[0][0] as {
      buffer: Buffer
      mimetype: string
      originalname: string
    }
    expect(file.mimetype).toBe('text/csv')
    expect(file.originalname).toBe('contacts-ba-1.csv')
    expect(file.buffer.toString('utf8')).toBe('id,first_name\na,Ana\nb,Beto')
    expect(actions.setResultFile).toHaveBeenCalledWith('tenant_acme', 'ba-1', 'https://signed')
  })

  it('serializes JSON with the same column filter and null padding', () => {
    const json = toJson([{ id: '1', name: 'Ana', is_active: true }, { id: '2' }], ['id', 'name'])
    expect(JSON.parse(json)).toEqual([
      { id: '1', name: 'Ana' },
      { id: '2', name: null },
    ])
  })

  it('serializes XLSX with a header row and one row per record', async () => {
    const buffer = await toXlsx([{ id: '1', name: 'Ana', tags: ['vip'] }])
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer)
    const sheet = workbook.getWorksheet(1)
    if (!sheet) throw new Error('missing sheet')
    expect(sheet.getRow(1).values).toEqual([undefined, 'id', 'name', 'tags'])
    expect(sheet.getRow(2).values).toEqual([undefined, '1', 'Ana', '["vip"]'])
  })

  it('names the file after the requested format and a slugified custom name', () => {
    const context = ctx({ action: 'export', entity: 'contacts' })
    expect(exportFileName(context, { format: 'xlsx', fileName: 'Clientes Medellín 2026' })).toBe(
      'clientes-medellin-2026.xlsx',
    )
    expect(exportFileName(context, { format: 'json' })).toBe('contacts-ba-1.json')
    expect(exportFileName(context, {})).toBe('contacts-ba-1.csv')
  })

  it('uploads an xlsx with the spreadsheet mime type when asked', async () => {
    const targets = {
      findRowsForExport: jest.fn().mockResolvedValue([{ id: 'a', first_name: 'Ana' }]),
    }
    const actions = { setResultFile: jest.fn() }
    const s3 = {
      upload: jest.fn().mockResolvedValue({ key: 'k', url: 'u' }),
      presignedUrl: jest.fn().mockResolvedValue('https://signed'),
    }
    const handler = new ExportHandler(
      targets as unknown as BulkTargetsRepository,
      actions as unknown as BulkActionsRepository,
      s3 as unknown as S3Service,
    )
    await handler.run(
      ctx({ action: 'export', params: { format: 'xlsx' }, total: 1, processed: 0 }),
      ['a'],
    )
    const file = s3.upload.mock.calls[0][0] as { mimetype: string; originalname: string }
    expect(file.mimetype).toContain('spreadsheetml')
    expect(file.originalname).toBe('contacts-ba-1.xlsx')
  })
})

describe('snapshot specs', () => {
  it('declares exactly the columns each mutation touches', () => {
    const targets = {} as unknown as BulkTargetsRepository
    expect(new TagsHandler(targets).snapshotSpec()).toEqual({ columns: ['tags'] })
    const update = new UpdateFieldHandler(targets)
    expect(update.snapshotSpec(ctx({ params: { field: 'status', value: 'x' } }).action)).toEqual({
      columns: ['status'],
    })
    expect(
      update.snapshotSpec(ctx({ params: { field: 'custom:eps', value: 'x' } }).action),
    ).toEqual({
      columns: [],
      customKey: 'eps',
    })
    expect(update.snapshotSpec(ctx({ params: { field: 'email', value: 'x' } }).action)).toBeNull()
  })
})

describe('RevertHandler', () => {
  it('restores the snapshotted values and reports rows without a snapshot', async () => {
    const snapshots = {
      findByAction: jest.fn().mockResolvedValue([
        { entity_id: 'a', before: { tags: ['old'] } },
        { entity_id: 'b', before: { is_active: true } },
      ]),
    }
    const targets = {
      restoreSnapshot: jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
    }
    const handler = new RevertHandler(
      targets as unknown as BulkTargetsRepository,
      snapshots as unknown as BulkSnapshotsRepository,
    )

    const outcome = await handler.run(ctx({ action: 'revert', params: { sourceId: 'ba-0' } }), [
      'a',
      'b',
      'c',
    ])

    expect(snapshots.findByAction).toHaveBeenCalledWith('tenant_acme', 'ba-0', ['a', 'b', 'c'])
    expect(targets.restoreSnapshot).toHaveBeenCalledWith('tenant_acme', 'contacts', 'a', {
      tags: ['old'],
    })
    expect(outcome).toEqual({
      succeeded: ['a'],
      errors: [
        { id: 'b', message: 'not_found' },
        { id: 'c', message: 'no_snapshot' },
      ],
    })
  })
})
