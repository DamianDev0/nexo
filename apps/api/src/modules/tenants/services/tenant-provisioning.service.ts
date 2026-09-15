import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { DataSource } from 'typeorm'
import { getTenantSchemaSQL, getTenantIndicesSQL } from '../constants/tenant-schema.sql'
import { applyPendingMigrations } from '@/shared/database/tenant-migration.runner'

@Injectable()
export class TenantProvisioningService {
  constructor(
    @InjectPinoLogger(TenantProvisioningService.name)
    private readonly logger: PinoLogger,
    private readonly dataSource: DataSource,
  ) {}

  async createTenantSchema(schemaName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`)
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`)
      await queryRunner.query(getTenantSchemaSQL(schemaName))
      await queryRunner.query(getTenantIndicesSQL(schemaName))
      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.logger.error({ schemaName, err: error }, 'Failed to create tenant schema')
      throw error
    } finally {
      await queryRunner.release()
    }

    await this.applyMigrations(schemaName)
    this.logger.info({ schemaName }, 'Tenant schema created')
  }

  async dropTenantSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`)
    this.logger.warn({ schemaName }, 'Tenant schema dropped')
  }

  private async applyMigrations(schemaName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    try {
      const outcome = await applyPendingMigrations(queryRunner, schemaName)
      if (outcome.failed) {
        this.logger.error(
          { schemaName, migration: outcome.failed.id, err: outcome.failed.error },
          'Tenant migration failed during provisioning',
        )
        throw new InternalServerErrorException('Tenant provisioning failed')
      }
    } finally {
      await queryRunner.release()
    }
  }
}
