import { expect, type APIRequestContext, type Page } from '@playwright/test'

const API = process.env.E2E_API_URL ?? 'http://localhost:8080/api/v1'
const PASSWORD = 'TestPass123!'
const TOTAL_STEPS = 7

export interface Workspace {
  readonly slug: string
  readonly email: string
  readonly password: string
}

export async function onboardWorkspace(request: APIRequestContext): Promise<Workspace> {
  const slug = `e2e-nav-${Date.now()}-${Math.floor(Math.random() * 10_000)}`
  const email = `owner@${slug}.com`

  const response = await request.post(`${API}/auth/onboard`, {
    data: {
      businessName: 'E2E Navigation Corp',
      slug,
      ownerEmail: email,
      ownerPassword: PASSWORD,
      ownerFullName: 'E2E Owner',
    },
  })
  expect(response.status(), await response.text()).toBe(201)

  return { slug, email, password: PASSWORD }
}

export async function loginAs(page: Page, workspace: Workspace): Promise<void> {
  await page.goto('/login')
  await page.getByRole('textbox').first().fill(workspace.email)
  await page.locator('input[type="password"]').fill(workspace.password)
  await page.getByRole('button', { name: /log in|iniciar/i }).click()
  await page.waitForURL(/\/(dashboard|onboarding\/setup)/, { timeout: 20_000 })

  const done = await page.request.patch(`${API}/settings/onboarding`, {
    headers: { 'x-tenant-slug': workspace.slug },
    data: { step: TOTAL_STEPS, completed: true },
  })
  expect(done.ok(), await done.text()).toBe(true)
}
