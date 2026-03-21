import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { DataSource } from 'typeorm'
import { TENANT_MIGRATIONS } from './tenant-migrations'
import type { SchemaRow, MigrationRow } from './tenant-migration.interfaces'

@Injectable()
export class TenantMigrationService implements OnApplicationBootstrap {
  constructor(
    @InjectPinoLogger(TenantMigrationService.name)
    private readonly logger: PinoLogger,
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const schemas = await this.getAllTenantSchemas()

    if (schemas.length === 0) {
      this.logger.info('No tenant schemas found — skipping migrations')
      return
    }

    this.logger.info({ count: schemas.length }, 'Running tenant schema migrations')

    for (const schema of schemas) {
      await this.migrateSchema(schema)
    }

    this.logger.info('Tenant schema migrations complete')
  }

  private async getAllTenantSchemas(): Promise<string[]> {
    const raw: unknown = await this.dataSource.query(
      `SELECT "schemaName" AS schema_name FROM public.tenants WHERE "isActive" = true`,
    )
    return (raw as SchemaRow[]).map((r) => r.schema_name)
  }

  private async migrateSchema(schemaName: string): Promise<void> {
    const qr = this.dataSource.createQueryRunner()
    await qr.connect()

    try {
      // Ensure the migrations tracking table exists (bootstraps old schemas)
      await qr.query(`
        CREATE TABLE IF NOT EXISTS "${schemaName}".schema_migrations (
          id         VARCHAR(100) PRIMARY KEY,
          applied_at TIMESTAMPTZ  DEFAULT NOW()
        )
      `)

      // Find already-applied migration IDs
      const applied = (await qr.query(
        `SELECT id FROM "${schemaName}".schema_migrations`,
      )) as MigrationRow[]
      const appliedIds = new Set(applied.map((r) => r.id))

      const pending = TENANT_MIGRATIONS.filter((m) => !appliedIds.has(m.id))

      if (pending.length === 0) return

      this.logger.info({ schemaName, count: pending.length }, 'Applying pending migrations')

      for (const migration of pending) {
        await qr.startTransaction()
        try {
          await qr.query(migration.up(schemaName))
          await qr.query(`INSERT INTO "${schemaName}".schema_migrations (id) VALUES ($1)`, [
            migration.id,
          ])
          await qr.commitTransaction()
          this.logger.info({ schemaName, migration: migration.id }, 'Migration applied')
        } catch (err) {
          await qr.rollbackTransaction()
          this.logger.error(
            { schemaName, migration: migration.id, err },
            'Migration failed — skipping remaining migrations for this schema',
          )
          break
        }
      }
    } finally {
      await qr.release()
    }
  }
}
