import { expect, test, type Page } from '@playwright/test'

import {
  loginAs,
  onboardWorkspace,
  readContact,
  seedActivity,
  seedContact,
  type Workspace,
} from './fixtures/tenant'

test.describe.configure({ mode: 'serial' })
test.use({ locale: 'es-CO', viewport: { width: 1440, height: 900 } })
test.setTimeout(120_000)

let ws: Workspace

async function openContacts(page: Page) {
  await page.goto('/contacts')
  await page
    .evaluate(() => document.querySelector('nextjs-portal')?.remove())
    .catch(() => undefined)
  await page.locator('[data-slot="table-body"]').first().waitFor({ timeout: 30_000 })
  await page.waitForTimeout(600)
}

test.beforeAll(async ({ request }) => {
  ws = await onboardWorkspace(request)
})

test.beforeEach(async ({ page }) => {
  await loginAs(page, ws)
})

test('a contact keeps its data after being seeded', async ({ page }) => {
  await seedContact(page, ws, {
    firstName: 'Laura',
    lastName: 'Jiménez Rojas',
    email: 'laura@empresa.co',
    phone: '3001234567',
    city: 'Medellín',
    municipioCode: '05001',
  })
  await openContacts(page)

  await expect(page.getByText('Laura Jiménez Rojas').first()).toBeVisible()
})

test('emptying a field in the quick view clears it instead of failing', async ({ page }) => {
  const contact = await seedContact(page, ws, {
    firstName: 'Borrable',
    lastName: 'Apellido',
    email: 'borrable@empresa.co',
  })
  await openContacts(page)
  await page
    .getByRole('row')
    .filter({ hasText: 'Borrable' })
    .first()
    .getByRole('button', { name: /vista rápida/i })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.waitForTimeout(600)

  const patches: number[] = []
  page.on('response', (r) => {
    if (r.request().method() === 'PATCH' && r.url().includes('/contacts/')) patches.push(r.status())
  })

  await page
    .getByRole('textbox', { name: /apellido/i })
    .first()
    .fill('')
  await page.keyboard.press('Tab')

  await expect.poll(() => patches, { timeout: 15_000 }).toContain(200)
  expect(patches.filter((status) => status >= 400)).toEqual([])

  await expect
    .poll(async () => readContact(page, ws, contact.id).then((c) => c.lastName), {
      timeout: 15_000,
    })
    .toBeNull()
})

test('a pending task can be completed and reopened from the timeline', async ({ page }) => {
  const contact = await seedContact(page, ws, { firstName: 'Sebastián', lastName: 'Castro' })
  await seedActivity(page, ws, {
    activityType: 'task',
    title: 'Llamar para cierre',
    contactId: contact.id,
    dueDate: new Date(Date.now() + 86_400_000).toISOString(),
  })

  await openContacts(page)
  await page
    .getByRole('row')
    .filter({ hasText: 'Sebastián' })
    .first()
    .getByRole('button', { name: /vista rápida/i })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page
    .locator('[data-slot="record-drawer-section"] button[aria-expanded]')
    .filter({ hasText: /tareas/i })
    .first()
    .click()
  await page.waitForTimeout(600)

  const toggle = page.getByRole('checkbox', { name: /completada/i }).first()
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await toggle.click()

  const reopen = page.getByRole('checkbox', { name: /reabrir/i }).first()
  await expect(reopen).toBeVisible({ timeout: 15_000 })
  await expect(reopen).toHaveAttribute('aria-checked', 'true')

  await reopen.click()
  await expect(page.getByRole('checkbox', { name: /completada/i }).first()).toBeVisible({
    timeout: 15_000,
  })
})

test('an overdue task is called out and surfaces as the next activity', async ({ page }) => {
  const contact = await seedContact(page, ws, { firstName: 'Overdue', lastName: 'Vencida' })
  await seedActivity(page, ws, {
    activityType: 'task',
    title: 'Cotización atrasada',
    contactId: contact.id,
    dueDate: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    priority: 'high',
  })

  await openContacts(page)
  const row = page.getByRole('row').filter({ hasText: 'Overdue' }).first()
  await expect(row.getByText(/vencida/i).first()).toBeVisible()
})

test('the timeline filter narrows the entries to one kind', async ({ page }) => {
  const contact = await seedContact(page, ws, { firstName: 'Filtro', lastName: 'Timeline' })
  await seedActivity(page, ws, {
    activityType: 'call',
    title: 'Llamada inicial',
    contactId: contact.id,
  })
  await seedActivity(page, ws, {
    activityType: 'note',
    title: 'Nota importante',
    contactId: contact.id,
  })

  await openContacts(page)
  await page
    .getByRole('row')
    .filter({ hasText: 'Filtro' })
    .first()
    .getByRole('button', { name: /vista rápida/i })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page
    .locator('[data-slot="record-drawer-section"] button[aria-expanded]')
    .filter({ hasText: /actividad/i })
    .first()
    .click()
  await page.waitForTimeout(700)

  const filters = page.getByRole('radiogroup').first()
  await expect(page.getByText('Llamada inicial').first()).toBeVisible()
  await expect(page.getByText('Nota importante').first()).toBeVisible()

  await filters.getByRole('radio', { name: /^llamadas$/i }).click()
  await expect(page.getByText('Llamada inicial').first()).toBeVisible()
  await expect(page.getByText('Nota importante')).toHaveCount(0)
})

test('closing the quick view with Escape returns focus to the row that opened it', async ({
  page,
}) => {
  await seedContact(page, ws, { firstName: 'Escapar', lastName: 'Foco' })
  await openContacts(page)
  const trigger = page
    .getByRole('row')
    .filter({ hasText: 'Escapar' })
    .first()
    .getByRole('button', { name: /vista rápida/i })
  await trigger.click()
  await expect(page.locator('[data-slot="record-drawer"]')).toBeVisible()
  await page.locator('[data-slot="record-drawer"]').click({ position: { x: 10, y: 10 } })
  await page.waitForTimeout(800)

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-slot="record-drawer"]')).toHaveCount(0, { timeout: 15_000 })

  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? ''), {
      timeout: 10_000,
    })
    .toMatch(/vista rápida/i)
})

test('a very long name stays inside its column instead of stretching the table', async ({
  page,
}) => {
  await seedContact(page, ws, {
    firstName: 'Juan Pablo Rodríguez de la Santísima Trinidad Vásquez',
    lastName: 'Montoya Villalobos Restrepo Echeverri',
    email: 'nombre.extremadamente.largo.para.probar.overflow@dominio-corporativo-larguisimo.com.co',
  })
  await openContacts(page)

  const overflow = await page.evaluate(() => {
    const root = document.querySelector('[data-slot="table-root"]')
    return root ? root.scrollWidth - root.clientWidth : 0
  })
  const documentOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )

  expect(documentOverflow).toBeLessThanOrEqual(0)
  expect(overflow).toBeLessThan(4000)
})
