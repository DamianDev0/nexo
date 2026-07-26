import type { DataSource } from 'typeorm'
import { PlanName } from '@repo/shared-types'
import { Plan } from '../entities/plan.entity'

type PlanSeed = {
  name: PlanName
  priceCop: number
  limits: Plan['limits']
}

const PLANS: PlanSeed[] = [
  {
    name: PlanName.FREE,
    priceCop: 0,
    limits: {
      users: 1,
      contacts: 100,
      invoicesPerMonth: 10,
      workflows: 1,
      whatsapp: 'manual_only',
      ai: false,
      apiAccess: false,
      requestsPerMinute: 100,
    },
  },
  {
    name: PlanName.STARTER,
    priceCop: 7900000,
    limits: {
      users: 3,
      contacts: 1000,
      invoicesPerMonth: 100,
      workflows: 3,
      whatsapp: 'manual_only',
      ai: false,
      apiAccess: false,
      requestsPerMinute: 300,
    },
  },
  {
    name: PlanName.PRO,
    priceCop: 19900000,
    limits: {
      users: 10,
      contacts: 10000,
      invoicesPerMonth: 500,
      workflows: 10,
      whatsapp: 'bot',
      ai: true,
      apiAccess: true,
      requestsPerMinute: 600,
    },
  },
  {
    name: PlanName.BUSINESS,
    priceCop: 49900000,
    limits: {
      users: 50,
      contacts: 50000,
      invoicesPerMonth: 2000,
      workflows: 50,
      whatsapp: 'bot',
      ai: true,
      apiAccess: true,
      requestsPerMinute: 1200,
    },
  },
]

export async function seedPlans(dataSource: DataSource): Promise<void> {
  const planRepo = dataSource.getRepository(Plan)

  for (const planData of PLANS) {
    const exists = await planRepo.findOne({ where: { name: planData.name } })
    if (!exists) {
      await planRepo.save(planRepo.create(planData))
      console.log(`  ✓ Plan "${planData.name}" created`)
    } else {
      console.log(`  – Plan "${planData.name}" already exists`)
    }
  }
}
