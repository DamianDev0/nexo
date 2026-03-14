import { Injectable } from '@nestjs/common'
import { DataSource, QueryRunner } from 'typeorm'

@Injectable()
export class TenantDbService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Executes a callback within the context of a tenant's schema.
   * Sets search_path to the tenant schema before executing and resets after.
   */
  async query<T>(
    schemaName: string,
    fn: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()

    try {
      await queryRunner.query(`SET search_path TO "${schemaName}", public`)
      return await fn(queryRunner)
    } finally {
      await queryRunner.query(`SET search_path TO public`)
      await queryRunner.release()
    }
  }

  /**
   * Executes raw SQL within a tenant's schema inside a transaction.
   */
  async transactional<T>(
    schemaName: string,
    fn: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      await queryRunner.query(`SET search_path TO "${schemaName}", public`)
      const result = await fn(queryRunner)
      await queryRunner.commitTransaction()
      return result
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.query(`SET search_path TO public`)
      await queryRunner.release()
    }
  }
}
