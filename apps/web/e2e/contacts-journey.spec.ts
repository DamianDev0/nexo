import { expect, test, type Page } from '@playwright/test'

import { dismissDevOverlay, seedContact } from './fixtures/contacts'
import { loginAs, onboardWorkspace, type Workspace } from './fixtures/tenant'

test.describe.configure({ mode: 'serial' })
test.use({ locale: 'es-CO' })

const SEEDS = [
  { firstName: 'Carlos', lastName: 'Gómez', email: 'carlos@acme.co', status: 'in_contact' },
  { firstName: 'Ana', lastName: 'Ruiz', email: 'ana@acme.co', status: 'qualified' },
  { firstName: 'Luis', lastName: 'Pérez', email: 'luis@acme.co', status: 'client' },
  { firstName: 'María', lastName: 'López', email: 'maria@acme.co', status: 'new' },
  { firstName: 'Pedro', lastName: 'Díaz', email: 'pedro@acme.co', source: 'whatsapp' },
] as const

let workspace: Workspace

async function openContacts(page: Page): Promise<void> {
  await page.goto('/contacts')
  await dismissDevOverlay(page)
  await expect(page.locator('[data-slot="table-smart-lists"]')).toBeVisible()
  await expect(page.locator('[data-slot="table-skeleton"]')).toHaveCount(0)
}

function searchBox(page: Page) {
  return page.getByPlaceholder('Nombre, email, teléfono o documento')
}

async function openSearch(page: Page): Promise<void> {
  const toggle = page.locator('[data-slot="table-search"]').getByRole('button')
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
    await toggle.click()
    await expect(searchBox(page)).toBeVisible()
  }
}

test.describe('contacts › journey', () => {
  test.beforeAll(async ({ request }) => {
    workspace = await onboardWorkspace(request)
  })

  test.beforeEach(async ({ page }) => {
    await loginAs(page, workspace)
  })

  test('starts empty and creates the first contact from the CTA', async ({ page }) => {
    await openContacts(page)
    await expect(page.getByText('Aún no hay contactos')).toBeVisible()

    await page.getByRole('button', { name: 'Crear contacto' }).click()
    await expect(page.getByRole('heading', { name: /^Nuevo /i })).toBeVisible()
    await page.locator('input[name="firstName"]').fill('Valentina')
    await page.locator('input[name="lastName"]').fill('Restrepo')
    await page.locator('input[name="email"]').fill('valentina@acme.co')

    const created = page.waitForResponse(
      (res) => res.url().includes('/contacts') && res.request().method() === 'POST',
    )
    await page
      .getByRole('button', { name: /^Crear /i })
      .last()
      .click()
    expect((await created).status()).toBe(201)

    await expect(page.getByRole('heading', { name: /^Nuevo /i })).toHaveCount(0)
    await expect(page.getByText('Valentina Restrepo')).toBeVisible()
  })

  test('edits the contact from the quick preview', async ({ page }) => {
    await openContacts(page)

    const row = page.getByRole('row').filter({ hasText: 'Valentina Restrepo' })
    await row.getByRole('button', { name: 'Vista rápida' }).click()
    await page.getByRole('button', { name: 'Editar contacto' }).click()
    await expect(page.getByRole('heading', { name: 'Editar contacto' })).toBeVisible()

    await page.locator('input[name="lastName"]').fill('Restrepo Vélez')
    const updated = page.waitForResponse(
      (res) => res.url().includes('/contacts/') && res.request().method() === 'PATCH',
    )
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    expect((await updated).ok()).toBe(true)

    await expect(page.getByText('Valentina Restrepo Vélez')).toBeVisible()
  })

  test('searches by name and resets to the full list', async ({ page }) => {
    for (const seed of SEEDS) await seedContact(page, workspace, seed)
    await openContacts(page)
    await expect(page.getByText('6 contactos')).toBeVisible()

    await openSearch(page)
    await searchBox(page).fill('carlos')
    await expect(page).toHaveURL(/q=carlos/)
    await expect(page.getByText('Carlos Gómez')).toBeVisible()
    await expect(page.getByText('Valentina Restrepo Vélez')).toHaveCount(0)

    await searchBox(page).clear()
    await expect(page.getByText('6 contactos')).toBeVisible()
  })

  test('quick filter by source narrows and toggles back', async ({ page }) => {
    await openContacts(page)

    await page.getByRole('button', { name: 'Origen' }).click()
    await page.getByRole('menuitem', { name: 'WhatsApp' }).click()
    await expect(page.getByText('Pedro Díaz')).toBeVisible()
    await expect(page.getByText('Carlos Gómez')).toHaveCount(0)

    await page.getByRole('button', { name: 'Quitar WhatsApp' }).click()
    await expect(page.getByText('Carlos Gómez')).toBeVisible()
  })

  test('smart lists filter by status, hotkey returns to all', async ({ page }) => {
    await openContacts(page)

    await page.getByRole('tab', { name: /^Calificado \d+$/ }).press('Enter')
    await expect(page.getByText('Ana Ruiz')).toBeVisible()
    await expect(page.getByText('Luis Pérez')).toHaveCount(0)

    await page.keyboard.press('1')
    await expect(page.getByText('Luis Pérez')).toBeVisible()
    await expect(page.getByText('6 contactos')).toBeVisible()
  })

  test('a late slow response never overwrites the newest search', async ({ page }) => {
    await openContacts(page)

    let delayed = false
    await page.route('**/contacts?*', async (route) => {
      const isStale = route.request().url().includes('q=valen') && !delayed
      if (isStale) {
        delayed = true
        await new Promise((resolve) => setTimeout(resolve, 1_200))
      }
      await route.continue()
    })

    const staleIssued = page.waitForRequest((req) => req.url().includes('q=valen'))
    await openSearch(page)
    await searchBox(page).fill('valen')
    await staleIssued
    const staleSettled = page.waitForResponse((res) => res.url().includes('q=valen'))
    await searchBox(page).fill('carlos')

    await expect(page.getByText('Carlos Gómez')).toBeVisible()
    await staleSettled
    await expect(page.getByText('Carlos Gómez')).toBeVisible()
    await expect(page.getByText('Valentina Restrepo Vélez')).toHaveCount(0)
  })

  test('bulk select all archives every contact', async ({ page }) => {
    await openContacts(page)

    await page.getByRole('checkbox', { name: 'Seleccionar todas las filas' }).click()
    await expect(page.getByText('6 seleccionados')).toBeVisible()

    const deletions: string[] = []
    page.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/contacts/')) deletions.push(req.url())
    })
    await page.getByRole('button', { name: 'Archivar seleccionados' }).click()

    await expect(page.getByText('Aún no hay contactos')).toBeVisible({ timeout: 15_000 })
    expect(deletions).toHaveLength(6)
  })
})
