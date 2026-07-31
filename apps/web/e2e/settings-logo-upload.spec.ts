import { expect, test, type Page } from '@playwright/test'

import { loginAs, onboardWorkspace } from './fixtures/tenant'

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
const STORAGE_DOWN = 'File storage is unavailable, nothing was saved'

async function openBrandSettings(page: Page): Promise<void> {
  await page.goto('/settings/appearance/brand')
  await expect(page.getByText(/click or drag to upload/i)).toBeVisible()
  await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())
}

test.describe('settings › logo upload', () => {
  test('a rejected upload says why and leaves no logo behind', async ({ page, request }) => {
    const workspace = await onboardWorkspace(request)
    await loginAs(page, workspace)

    await page.route('**/settings/branding/logo', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 503,
          message: STORAGE_DOWN,
          error: 'SERVICE_UNAVAILABLE',
        }),
      }),
    )

    await openBrandSettings(page)
    await page.setInputFiles('input[type="file"]', {
      name: 'logo.png',
      mimeType: 'image/png',
      buffer: PNG,
    })

    await expect(page.getByText(STORAGE_DOWN).first()).toBeVisible({ timeout: 10_000 })
    await expect(
      page.getByText(/click or drag to upload/i),
      'the failed upload left a logo preview in place',
    ).toBeVisible()

    const inlineError = page.locator('[data-slot="upload-error"]')
    await expect(inlineError, 'nothing on the page records the failure').toContainText(STORAGE_DOWN)

    await expect(page.locator('[data-sileo-content]')).toHaveCount(0, { timeout: 20_000 })
    await expect(inlineError, 'the failure vanished with the toast').toContainText(STORAGE_DOWN)
  })

  test('a stored upload keeps the preview', async ({ page, request }) => {
    const workspace = await onboardWorkspace(request)
    await loginAs(page, workspace)

    await page.route('**/settings/branding/logo', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { url: 'https://cdn.example.com/logo.png', key: 'logo.png' },
        }),
      }),
    )

    await openBrandSettings(page)
    await page.setInputFiles('input[type="file"]', {
      name: 'logo.png',
      mimeType: 'image/png',
      buffer: PNG,
    })

    await expect(page.getByText(/uploaded|subido/i).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/click or drag to upload/i)).toBeHidden()
  })
})
