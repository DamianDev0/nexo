import { DataSource } from 'typeorm'
import { Plan } from '../entities/plan.entity'

const PLANS = [
  {
    name: 'free',
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
    name: 'starter',
    priceCop: 7900000, // $79.000 COP in centavos
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
    name: 'pro',
    priceCop: 19900000, // $199.000 COP in centavos
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
    name: 'business',
    priceCop: 49900000, // $499.000 COP in centavos
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
