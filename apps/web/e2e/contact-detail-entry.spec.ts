import { expect, test } from '@playwright/test'

import { loginAs, onboardWorkspace, seedContact } from './fixtures/tenant'

import type { Workspace } from './fixtures/tenant'

test.describe.configure({ mode: 'serial' })

let workspace: Workspace
let contactId: string

test.beforeAll(async ({ request }) => {
  workspace = await onboardWorkspace(request)
})

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await loginAs(page, workspace)
  if (!contactId) {
    const contact = await seedContact(page, workspace, {
      firstName: 'Hannah',
      lastName: 'Weiss',
      email: 'hannah@weiss.co',
      phone: '3001234567',
    })
    contactId = contact.id
  }
  await page.goto('/contacts')
  await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())
  await expect(page.locator('[data-slot="table-body"]').first()).toBeVisible()
})

const detailUrl = () => new RegExp(`/contacts/${contactId}$`)

test('opens the record from the name in the row', async ({ page }) => {
  await page.getByRole('button', { name: 'Hannah Weiss' }).click()

  await expect(page).toHaveURL(detailUrl())
})

test('opens the record from the row action menu', async ({ page }) => {
  const row = page.locator('[data-slot="table-body"]').first().getByRole('row').first()
  await row.getByRole('button', { name: /^acciones$|^actions$/i }).click()
  await page.getByRole('menuitem', { name: /ver registro|view record/i }).click()

  await expect(page).toHaveURL(detailUrl())
})

test('escalates from the quick view drawer to the record', async ({ page }) => {
  const row = page.locator('[data-slot="table-body"]').first().getByRole('row').first()
  await row.getByRole('button', { name: /vista rápida|quick view/i }).click()

  const footer = page.locator('[data-slot="record-drawer-footer"]')
  await expect(footer).toBeVisible()
  await footer.getByRole('button', { name: /ver registro|view record/i }).click()

  await expect(page).toHaveURL(detailUrl())
})
