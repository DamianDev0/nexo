import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { sqlRows } from '@/shared/database/sql.util'
import {
  MESSAGE_COLUMNS,
  MESSAGE_STATUS_RANK,
  MESSAGE_STATUS_RANK_SQL,
} from '../constants/message.constants'
import type {
  MessageInsertValues,
  MessageListFilters,
  MessageRow,
  MessageSentValues,
  MessageStatusUpdate,
} from '../interfaces/message-row.interfaces'

@Injectable()
export class MessagesRepository {
  constructor(private readonly db: TenantDbService) {}

  async insertQueued(schemaName: string, values: MessageInsertValues): Promise<MessageRow> {
    return this.db.query(schemaName, async (qr): Promise<MessageRow> => {
      const rows = await sqlRows<MessageRow[]>(
        qr,
        `INSERT INTO messages (
           channel, direction, status, provider,
           from_number, to_number, body, contact_id, user_id
         ) VALUES ('sms', 'outbound', 'queued', 'twilio', $1, $2, $3, $4, $5)
         RETURNING ${MESSAGE_COLUMNS}`,
        [values.fromNumber, values.toNumber, values.body, values.contactId, values.userId],
      )
      return rows[0]!
    })
  }

  async markSent(schemaName: string, values: MessageSentValues): Promise<MessageRow | null> {
    return this.db.query(schemaName, async (qr): Promise<MessageRow | null> => {
      const rows = await sqlRows<MessageRow[]>(
        qr,
        `UPDATE messages
         SET status = 'sent', provider_message_sid = $2, segments = $3,
             sent_at = NOW(), updated_at = NOW()
         WHERE id = $1 AND sent_at IS NULL
         RETURNING ${MESSAGE_COLUMNS}`,
        [values.messageId, values.providerMessageSid, values.segments],
      )
      return rows[0] ?? null
    })
  }

  async markFailed(schemaName: string, messageId: string, errorCode: string | null): Promise<void> {
    await this.db.query(schemaName, async (qr) => {
      await qr.query(
        `UPDATE messages
         SET status = 'failed', error_code = $2::text, updated_at = NOW()
         WHERE id = $1 AND sent_at IS NULL`,
        [messageId, errorCode],
      )
    })
  }

  async applyProviderStatus(schemaName: string, update: MessageStatusUpdate): Promise<void> {
    await this.db.query(schemaName, async (qr) => {
      await qr.query(
        `UPDATE messages
         SET status = $2::text,
             error_code = COALESCE($3::text, error_code),
             delivered_at = CASE WHEN $2::text = 'delivered' THEN COALESCE(delivered_at, NOW()) ELSE delivered_at END,
             updated_at = NOW()
         WHERE provider_message_sid = $1
           AND (${MESSAGE_STATUS_RANK_SQL}) < $4::int`,
        [
          update.providerMessageSid,
          update.status,
          update.errorCode,
          MESSAGE_STATUS_RANK[update.status],
        ],
      )
    })
  }

  async findById(schemaName: string, messageId: string): Promise<MessageRow | null> {
    return this.db.query(schemaName, async (qr): Promise<MessageRow | null> => {
      const rows = await sqlRows<MessageRow[]>(
        qr,
        `SELECT ${MESSAGE_COLUMNS} FROM messages WHERE id = $1`,
        [messageId],
      )
      return rows[0] ?? null
    })
  }

  async findRecent(schemaName: string, filters: MessageListFilters): Promise<MessageRow[]> {
    return this.db.query(schemaName, async (qr): Promise<MessageRow[]> => {
      const params: unknown[] = [filters.limit]
      let where = ''
      if (filters.contactId) {
        params.push(filters.contactId)
        where = `WHERE contact_id = $${params.length}`
      }
      return sqlRows<MessageRow[]>(
        qr,
        `SELECT ${MESSAGE_COLUMNS} FROM messages ${where} ORDER BY created_at DESC LIMIT $1`,
        params,
      )
    })
  }
}
