import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { sqlRows } from '@/shared/database/sql.util'
import { CALL_COLUMNS, TERMINAL_CALL_STATUSES } from '../constants/call.constants'
import type {
  CallInsertValues,
  CallListFilters,
  CallOutcome,
  CallProgress,
  CallRow,
} from '../interfaces/call-row.interfaces'

@Injectable()
export class CallsRepository {
  constructor(private readonly db: TenantDbService) {}

  async insertOutbound(schemaName: string, values: CallInsertValues): Promise<CallRow> {
    return this.db.query(schemaName, async (qr): Promise<CallRow> => {
      const rows = await sqlRows<CallRow[]>(
        qr,
        `INSERT INTO calls (
           provider, provider_call_sid, direction, status,
           from_number, to_number, contact_id, user_id
         ) VALUES ('twilio', $1, 'outbound', 'initiated', $2, $3, $4, $5)
         ON CONFLICT (provider, provider_call_sid) DO UPDATE SET updated_at = NOW()
         RETURNING ${CALL_COLUMNS}`,
        [
          values.providerCallSid,
          values.fromNumber,
          values.toNumber,
          values.contactId,
          values.userId,
        ],
      )
      return rows[0]!
    })
  }

  async applyProgress(schemaName: string, progress: CallProgress): Promise<void> {
    await this.db.query(schemaName, async (qr) => {
      await qr.query(
        `UPDATE calls
         SET status = $2::text,
             answered_at = CASE WHEN $2::text = 'in_progress' THEN COALESCE(answered_at, NOW()) ELSE answered_at END,
             last_sequence = COALESCE($3::int, last_sequence),
             updated_at = NOW()
         WHERE provider_call_sid = $1
           AND ended_at IS NULL
           AND status <> ALL($4::text[])
           AND ($3::int IS NULL OR last_sequence IS NULL OR last_sequence < $3)`,
        [progress.providerCallSid, progress.status, progress.sequence, TERMINAL_CALL_STATUSES],
      )
    })
  }

  async finalize(schemaName: string, outcome: CallOutcome): Promise<CallRow | null> {
    return this.db.query(schemaName, async (qr): Promise<CallRow | null> => {
      const rows = await sqlRows<CallRow[]>(
        qr,
        `UPDATE calls
         SET status = CASE WHEN answered_at IS NULL AND $2::text = 'completed' THEN 'canceled' ELSE $2::text END,
             duration_seconds = CASE WHEN answered_at IS NULL THEN 0 ELSE $3::int END,
             ended_at = NOW(),
             updated_at = NOW()
         WHERE provider_call_sid = $1 AND ended_at IS NULL
         RETURNING ${CALL_COLUMNS}`,
        [outcome.providerCallSid, outcome.status, outcome.durationSeconds],
      )
      return rows[0] ?? null
    })
  }

  async findById(schemaName: string, callId: string): Promise<CallRow | null> {
    return this.db.query(schemaName, async (qr): Promise<CallRow | null> => {
      const rows = await sqlRows<CallRow[]>(qr, `SELECT ${CALL_COLUMNS} FROM calls WHERE id = $1`, [
        callId,
      ])
      return rows[0] ?? null
    })
  }

  async findRecent(schemaName: string, filters: CallListFilters): Promise<CallRow[]> {
    return this.db.query(schemaName, async (qr): Promise<CallRow[]> => {
      const params: unknown[] = [filters.limit]
      const clauses: string[] = []
      if (filters.contactId) {
        params.push(filters.contactId)
        clauses.push(`contact_id = $${params.length}`)
      }
      if (filters.userId) {
        params.push(filters.userId)
        clauses.push(`user_id = $${params.length}`)
      }
      const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''
      return sqlRows<CallRow[]>(
        qr,
        `SELECT ${CALL_COLUMNS} FROM calls ${where} ORDER BY started_at DESC LIMIT $1`,
        params,
      )
    })
  }
}
