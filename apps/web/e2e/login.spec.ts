import { expect, test } from '@playwright/test'

test.describe('login page', () => {
  test('renders the login form', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('textbox').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /log in|iniciar/i })).toBeVisible()
  })

  test('redirects protected routes to login without session', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page).toHaveURL(/\/login\?from=%2Fdashboard|\/login\?from=\/dashboard/)
  })
})
