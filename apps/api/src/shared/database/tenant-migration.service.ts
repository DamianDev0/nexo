import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { DataSource } from 'typeorm'
import { applyPendingMigrations } from './tenant-migration.runner'
import type { SchemaRow } from './tenant-migration.interfaces'

@Injectable()
export class TenantMigrationService implements OnApplicationBootstrap {
  constructor(
    @InjectPinoLogger(TenantMigrationService.name)
    private readonly logger: PinoLogger,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.config.get<boolean>('app.runMigrationsOnBoot')) {
      this.logger.info(
        'Skipping tenant migrations on boot (set RUN_MIGRATIONS_ON_BOOT=true to enable; prefer the migrate-all-tenants deploy job)',
      )
      return
    }

    await this.runAll()
  }

  async runAll(): Promise<void> {
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
      const outcome = await applyPendingMigrations(qr, schemaName)

      for (const id of outcome.applied) {
        this.logger.info({ schemaName, migration: id }, 'Migration applied')
      }

      if (outcome.failed) {
        this.logger.error(
          { schemaName, migration: outcome.failed.id, err: outcome.failed.error },
          'Migration failed — skipping remaining migrations for this schema',
        )
      }
    } finally {
      await qr.release()
    }
  }
}
