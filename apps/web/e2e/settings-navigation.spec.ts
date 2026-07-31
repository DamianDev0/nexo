import { expect, test, type Page } from '@playwright/test'

import { loginAs, onboardWorkspace } from './fixtures/tenant'

const ROW = '[data-slot="module-row"][data-module]'
const MODULE_COUNT = 9

async function openNavigationSettings(page: Page): Promise<void> {
  await page.goto('/settings/navigation')
  await expect(page.locator(ROW).first()).toBeVisible()
  await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())
}

async function rowOrder(page: Page): Promise<string[]> {
  return page
    .locator(ROW)
    .evaluateAll((rows) => rows.map((row) => row.getAttribute('data-module') ?? ''))
}

async function sidebarOrder(page: Page): Promise<string[]> {
  return page
    .locator('[data-nav-key]')
    .evaluateAll((items) => items.map((item) => item.getAttribute('data-nav-key') ?? ''))
}

async function dragAbove(page: Page, fromKey: string, toKey: string): Promise<void> {
  const start = await page.locator(`${ROW.slice(0, -1)}="${fromKey}"]`).boundingBox()
  const end = await page.locator(`${ROW.slice(0, -1)}="${toKey}"]`).boundingBox()
  if (!start || !end) throw new Error('module rows are not visible')

  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2 + 12, { steps: 4 })
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 12 })
  await page.mouse.up()

  await expect(page.locator(ROW)).toHaveCount(MODULE_COUNT)
}

test.describe('settings › navigation', () => {
  test('a reorder reaches the API, updates the sidebar and survives a reload', async ({
    page,
    request,
  }) => {
    const workspace = await onboardWorkspace(request)
    await loginAs(page, workspace)
    await openNavigationSettings(page)

    const before = await rowOrder(page)
    expect(before.indexOf('contacts')).toBeLessThan(before.indexOf('companies'))

    await dragAbove(page, 'companies', 'contacts')

    const reordered = await rowOrder(page)
    expect(reordered.indexOf('companies'), 'the drag never reordered the list').toBeLessThan(
      reordered.indexOf('contacts'),
    )

    const savePromise = page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().endsWith('/settings/navigation'),
    )
    await page.getByRole('button', { name: /save|guardar/i }).click()
    const saveResponse = await (await savePromise).response()
    expect(saveResponse?.status(), 'the save action failed').toBeLessThan(400)

    await expect
      .poll(async () => await sidebarOrder(page), {
        message: 'the app sidebar kept the stale order after saving',
        timeout: 10_000,
      })
      .toEqual(reordered)

    await page.reload()
    await expect(page.locator(ROW).first()).toBeVisible()
    await expect
      .poll(async () => await rowOrder(page), {
        message: 'the order did not survive the reload',
        timeout: 10_000,
      })
      .toEqual(reordered)
  })

  test('the save bar goes quiet once the reorder is stored', async ({ page, request }) => {
    const workspace = await onboardWorkspace(request)
    await loginAs(page, workspace)
    await openNavigationSettings(page)

    await dragAbove(page, 'companies', 'contacts')
    await page.getByRole('button', { name: /save|guardar/i }).click()

    await expect(page.getByText(/no changes|sin cambios/i)).toBeVisible({ timeout: 10_000 })
  })
})
