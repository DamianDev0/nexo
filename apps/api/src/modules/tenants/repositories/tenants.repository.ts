import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Tenant } from '../entities/tenant.entity'

@Injectable()
export class TenantsRepository {
  constructor(
    @InjectRepository(Tenant)
    private readonly repo: Repository<Tenant>,
  ) {}

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.repo.findOne({
      where: { slug, isActive: true },
      relations: ['plan'],
    })
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.repo.findOne({
      where: { id, isActive: true },
      relations: ['plan'],
    })
  }

  async findAll(): Promise<Tenant[]> {
    return this.repo.find({
      where: { isActive: true },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    })
  }

  async create(data: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.repo.create(data)
    return this.repo.save(tenant)
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await this.repo.count({ where: { slug } })
    return count > 0
  }
}
