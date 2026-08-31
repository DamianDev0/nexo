import { expect, test } from '@playwright/test'

import { loginAs, onboardWorkspace } from './fixtures/tenant'

const NAV_BUDGET_MS = 3000
const TAB_SWITCH_BUDGET_MS = 800

test.skip(!process.env.PERF, 'perf suite runs against a production build (PERF=1)')

test.describe('settings › performance', () => {
  test('settings page renders inside budget', async ({ page, request }) => {
    const ws = await onboardWorkspace(request)
    await loginAs(page, ws)

    const start = Date.now()
    await page.goto('/settings/company')
    await page.getByRole('heading', { level: 1 }).waitFor()
    expect(Date.now() - start).toBeLessThan(NAV_BUDGET_MS)

    const nav = await page.evaluate(() =>
      JSON.stringify(performance.getEntriesByType('navigation')[0]),
    )
    const timing = JSON.parse(nav) as { domContentLoadedEventEnd: number }
    expect(timing.domContentLoadedEventEnd).toBeLessThan(2000)
  })

  test('switching contact taxonomy tabs stays snappy and fires no full reload', async ({
    page,
    request,
  }) => {
    const ws = await onboardWorkspace(request)
    await loginAs(page, ws)

    await page.goto('/settings/contacts/status')
    await page.getByRole('heading', { level: 1 }).waitFor()
    const fullLoads = await page.evaluate(() => performance.getEntriesByType('navigation').length)

    for (const child of ['sources', 'types', 'tags', 'lifecycle']) {
      const href = `/settings/contacts/${child}`
      const start = Date.now()
      await page.locator(`a[href="${href}"]`).first().click()
      await page.waitForURL(`**${href}`)
      await page.getByRole('heading', { level: 1 }).waitFor()
      expect(Date.now() - start).toBeLessThan(TAB_SWITCH_BUDGET_MS)
    }

    const finalFullLoads = await page.evaluate(
      () => performance.getEntriesByType('navigation').length,
    )
    expect(finalFullLoads).toBe(fullLoads)
  })
})
