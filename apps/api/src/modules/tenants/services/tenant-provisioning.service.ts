import { Injectable } from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { DataSource } from 'typeorm'
import { getTenantSchemaSQL, getTenantIndicesSQL } from '../constants/tenant-schema.sql'

@Injectable()
export class TenantProvisioningService {
  constructor(
    @InjectPinoLogger(TenantProvisioningService.name)
    private readonly logger: PinoLogger,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new isolated PostgreSQL schema for a tenant
   * with all required tables, indices, and extensions.
   */
  async createTenantSchema(schemaName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`)
      await queryRunner.query(getTenantSchemaSQL(schemaName))
      await queryRunner.query(getTenantIndicesSQL(schemaName))
      await queryRunner.commitTransaction()
      this.logger.info({ schemaName }, 'Tenant schema created')
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.logger.error({ schemaName, err: error }, 'Failed to create tenant schema')
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Drops a tenant schema. USE WITH EXTREME CAUTION.
   * Intended for onboarding rollback only — never exposed via API.
   */
  async dropTenantSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`)
    this.logger.warn({ schemaName }, 'Tenant schema dropped')
  }
}
