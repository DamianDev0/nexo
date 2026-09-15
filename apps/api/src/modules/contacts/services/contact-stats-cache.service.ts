import { Injectable } from '@nestjs/common'
import type { ContactCounts, ContactTaxonomyUsage } from '@repo/shared-types'
import { CacheService } from '@/shared/cache/cache.service'

const STATS_TTL_SECONDS = 30
const VERSION_TTL_SECONDS = 24 * 60 * 60

@Injectable()
export class ContactStatsCacheService {
  constructor(private readonly cache: CacheService) {}

  async getCounts(schemaName: string, userId: string): Promise<ContactCounts | null> {
    return this.cache.get<ContactCounts>(await this.countsKey(schemaName, userId))
  }

  async setCounts(schemaName: string, userId: string, counts: ContactCounts): Promise<void> {
    await this.cache.set(await this.countsKey(schemaName, userId), counts, STATS_TTL_SECONDS)
  }

  async getUsage(schemaName: string): Promise<ContactTaxonomyUsage | null> {
    return this.cache.get<ContactTaxonomyUsage>(await this.usageKey(schemaName))
  }

  async setUsage(schemaName: string, usage: ContactTaxonomyUsage): Promise<void> {
    await this.cache.set(await this.usageKey(schemaName), usage, STATS_TTL_SECONDS)
  }

  async invalidate(schemaName: string): Promise<void> {
    await this.cache.set(this.versionKey(schemaName), Date.now(), VERSION_TTL_SECONDS)
  }

  private versionKey(schemaName: string): string {
    return `contacts:stats:version:${schemaName}`
  }

  private async version(schemaName: string): Promise<number> {
    return (await this.cache.get<number>(this.versionKey(schemaName))) ?? 0
  }

  private async countsKey(schemaName: string, userId: string): Promise<string> {
    return `contacts:stats:counts:${schemaName}:${userId}:${await this.version(schemaName)}`
  }

  private async usageKey(schemaName: string): Promise<string> {
    return `contacts:stats:usage:${schemaName}:${await this.version(schemaName)}`
  }
}
