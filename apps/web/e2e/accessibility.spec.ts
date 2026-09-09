import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { loginAs, onboardWorkspace, seedContact, type Workspace } from './fixtures/tenant'

test.describe.configure({ mode: 'serial' })
test.use({ locale: 'es-CO', viewport: { width: 1440, height: 900 } })
test.setTimeout(120_000)

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

let ws: Workspace

async function violations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(WCAG)
    .exclude('nextjs-portal')
    .exclude('[data-slot="theme-preview"]')
    .analyze()
  return result.violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.help}`)
}

async function settle(page: Page) {
  await page
    .evaluate(() => document.querySelector('nextjs-portal')?.remove())
    .catch(() => undefined)
  await page.waitForTimeout(800)
}

test.beforeAll(async ({ request }) => {
  ws = await onboardWorkspace(request)
})

test.beforeEach(async ({ page }) => {
  await loginAs(page, ws)
})

test('the contacts workspace has no WCAG violations', async ({ page }) => {
  await seedContact(page, ws, {
    firstName: 'Laura',
    lastName: 'Jiménez Rojas',
    email: 'laura@empresa.co',
    phone: '3001234567',
  })
  await page.goto('/contacts')
  await page.locator('[data-slot="table-body"]').first().waitFor({ timeout: 30_000 })
  await settle(page)

  expect(await violations(page)).toEqual([])
})

test('the contact quick view has no WCAG violations, including its timeline', async ({ page }) => {
  await page.goto('/contacts')
  await page.locator('[data-slot="table-body"]').first().waitFor({ timeout: 30_000 })
  await settle(page)

  await page
    .getByRole('button', { name: /vista rápida|quick view/i })
    .first()
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page
    .locator('[data-slot="record-drawer-section"] button[aria-expanded]')
    .filter({ hasText: /actividad|activity/i })
    .first()
    .click()
  await settle(page)

  expect(await violations(page)).toEqual([])
})

for (const path of [
  '/settings/company',
  '/settings/contacts/lifecycle',
  '/settings/contacts/sources',
  '/settings/contacts/tags',
  '/settings/pipelines',
]) {
  test(`${path} has no WCAG violations`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle').catch(() => undefined)
    await settle(page)

    expect(await violations(page)).toEqual([])
  })
}
