import { expect, test } from '@playwright/test'

import { loginAs, onboardWorkspace, seedActivity, seedContact } from './fixtures/tenant'

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
  if (contactId) return

  const contact = await seedContact(page, workspace, {
    firstName: 'Hannah',
    lastName: 'Weiss',
    email: 'hannah@weiss.co',
    phone: '3001234567',
  })
  contactId = contact.id

  await seedActivity(page, workspace, {
    contactId,
    activityType: 'note',
    title: 'Llamada inicial',
  })
  await seedActivity(page, workspace, {
    contactId,
    activityType: 'task',
    title: 'Enviar propuesta',
    dueDate: new Date(Date.now() + 86_400_000).toISOString(),
  })
  await seedActivity(page, workspace, {
    contactId,
    activityType: 'call',
    title: 'Seguimiento',
  })
})

test('opens the record with every region composed', async ({ page }) => {
  await page.goto(`/contacts/${contactId}`)
  await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())

  await expect(page.locator('[data-slot="record-layout-aside"]')).toBeVisible()
  await expect(page.locator('[data-slot="record-layout-main"]')).toBeVisible()
  await expect(page.locator('[data-slot="record-layout-rail"]')).toBeVisible()
  await expect(page.getByText('Hannah Weiss').first()).toBeVisible()

  const sections = page.locator('[data-slot="record-drawer-sections"]')
  await expect(sections.getByRole('button', { name: /etiquetas|tags/i })).toBeVisible()
  await expect(sections.getByRole('button', { name: /atribución|attribution/i })).toBeVisible()
  await expect(sections.getByRole('button', { name: /no contactar|do not contact/i })).toBeVisible()
})

test('docks a different panel from the rail', async ({ page }) => {
  await page.goto(`/contacts/${contactId}`)
  await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())

  const rail = page.locator('[data-slot="record-layout-rail"]')
  const panel = page.locator('[data-slot="record-layout-panel"]').first()
  await expect(panel).toBeVisible()

  await expect(panel.getByText('Llamada inicial')).toBeVisible()

  await rail.getByRole('button', { name: /tareas|tasks/i }).click()
  await expect(panel.getByText('Enviar propuesta')).toBeVisible()

  await panel.getByRole('button', { name: /cerrar panel|close panel/i }).click()
  await expect(page.locator('[data-slot="record-layout-panel"]')).toHaveCount(0)
})

test('switches the workspace tab without leaving the record', async ({ page }) => {
  await page.goto(`/contacts/${contactId}`)
  await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())

  const content = page.locator('[data-slot="record-layout-content"]')
  await expect(content.getByRole('textbox', { name: /nombre|first name/i })).toBeVisible()
  await expect(page.locator('[data-slot="record-layout-panel"]')).toBeVisible()

  const tabs = page.locator('[data-slot="record-layout-tabs"]')
  await tabs.getByRole('radio').nth(1).click()

  await expect(content.getByText('Seguimiento')).toBeVisible()
  await expect(content.getByRole('textbox', { name: /nombre|first name/i })).toBeHidden()
  await expect(page).toHaveURL(new RegExp(`/contacts/${contactId}$`))
})

test('names the record in the breadcrumb', async ({ page }) => {
  await page.goto(`/contacts/${contactId}`)
  await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())

  const crumbs = page.getByRole('navigation', { name: /breadcrumb/i })
  await expect(crumbs.getByText('Hannah Weiss')).toBeVisible()
  await expect(crumbs.getByRole('link', { name: /contactos|contacts/i })).toBeVisible()
})

test('walks back to the list', async ({ page }) => {
  await page.goto(`/contacts/${contactId}`)
  await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())

  await page.getByRole('link', { name: /volver a contactos|back to contacts/i }).click()

  await expect(page).toHaveURL(/\/contacts$/)
})
