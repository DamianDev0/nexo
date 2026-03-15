import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { InvitationRow } from '../interfaces/invitation-row.interface'
import type { CreateInvitationData } from '../interfaces/invitation-rows.interface'

@Injectable()
export class InvitationRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async create(schemaName: string, data: CreateInvitationData): Promise<InvitationRow> {
    return this.tenantDb.transactional<InvitationRow>(schemaName, async (qr) => {
      const raw: unknown = await qr.query(
        `INSERT INTO "${schemaName}".invitations
           (email, role, token_hash, invited_by, expires_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, role, token_hash, invited_by, expires_at, accepted_at, created_at`,
        [data.email.toLowerCase(), data.role, data.tokenHash, data.invitedBy, data.expiresAt],
      )
      const created = (raw as InvitationRow[])[0]
      if (!created) throw new Error('INSERT returned no rows')
      return created
    })
  }

  async findByTokenHash(schemaName: string, tokenHash: string): Promise<InvitationRow | undefined> {
    return this.tenantDb.query<InvitationRow | undefined>(schemaName, async (qr) => {
      const raw: unknown = await qr.query(
        `SELECT id, email, role, token_hash, invited_by, expires_at, accepted_at, created_at
         FROM "${schemaName}".invitations WHERE token_hash = $1 LIMIT 1`,
        [tokenHash],
      )
      return (raw as InvitationRow[])[0]
    })
  }

  async markAccepted(schemaName: string, id: string): Promise<void> {
    await this.tenantDb.query(schemaName, async (qr) => {
      await qr.query(`UPDATE "${schemaName}".invitations SET accepted_at = NOW() WHERE id = $1`, [
        id,
      ])
    })
  }

  async deleteByEmail(schemaName: string, email: string): Promise<void> {
    await this.tenantDb.query(schemaName, async (qr) => {
      await qr.query(`DELETE FROM "${schemaName}".invitations WHERE email = $1`, [
        email.toLowerCase(),
      ])
    })
  }
}
