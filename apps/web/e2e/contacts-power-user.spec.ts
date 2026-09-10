import { expect, test, type Page } from '@playwright/test'

import { loginAs, onboardWorkspace, seedContact, type Workspace } from './fixtures/tenant'

test.describe.configure({ mode: 'serial' })
test.use({ locale: 'es-CO', viewport: { width: 1440, height: 900 } })
test.setTimeout(120_000)

let ws: Workspace

const PEOPLE = [
  {
    firstName: 'Ana',
    lastName: 'Gómez',
    email: 'ana@acme.co',
    phone: '3001110001',
    source: 'whatsapp',
    status: 'new',
  },
  {
    firstName: 'Bruno',
    lastName: 'Ariza',
    email: 'bruno@acme.co',
    phone: '3001110002',
    source: 'whatsapp',
    status: 'qualified',
  },
  {
    firstName: 'Carla',
    lastName: 'Pardo',
    email: 'carla@acme.co',
    phone: '3001110003',
    source: 'referral',
    status: 'new',
  },
  {
    firstName: 'Diego',
    lastName: 'Suárez',
    email: 'diego@acme.co',
    phone: '3001110004',
    source: 'referral',
    status: 'qualified',
  },
]

const body = (page: Page) => page.locator('[data-slot="table-body"]').first()
const rows = (page: Page) => body(page).locator('tr')

async function openContacts(page: Page) {
  await page.goto('/contacts')
  await page
    .evaluate(() => document.querySelector('nextjs-portal')?.remove())
    .catch(() => undefined)
  await body(page).waitFor({ timeout: 30_000 })
  await expect(page.locator('[data-slot="table-skeleton"]')).toHaveCount(0)
  await page.waitForTimeout(500)
}

async function searchFor(page: Page, term: string) {
  const search = page.locator('[data-slot="table-search"] input').first()
  if ((await search.count()) === 0) {
    await page.locator('[data-slot="table-search"] button').first().click()
  }
  await page.locator('[data-slot="table-search"] input').first().fill(term)
  await page.waitForTimeout(1200)
}

test.beforeAll(async ({ request }) => {
  test.setTimeout(90_000)
  ws = await onboardWorkspace(request)
})

test.beforeEach(async ({ page }) => {
  await loginAs(page, ws)
})

test('seeds the workspace the power-user journey works on', async ({ page }) => {
  for (const person of PEOPLE) await seedContact(page, ws, person)
  await openContacts(page)

  await expect.poll(() => rows(page).count()).toBe(PEOPLE.length)
})

test('search narrows the list and survives a sort without losing the term', async ({ page }) => {
  await openContacts(page)
  await searchFor(page, 'carla')

  const matches = await rows(page).count()
  expect(matches).toBe(1)

  await page
    .getByRole('columnheader')
    .filter({ hasText: /nombre/i })
    .first()
    .click()
  await page.waitForTimeout(1500)

  await expect(page.locator('[data-slot="table-search"] input').first()).toHaveValue('carla')
  await expect.poll(() => rows(page).count()).toBe(matches)
})

test('a quick filter stacks on top of the search and both clear independently', async ({
  page,
}) => {
  await openContacts(page)
  await searchFor(page, 'a')
  const searched = await rows(page).count()

  await page.getByRole('button', { name: /^origen$/i }).click()
  await page
    .getByRole('option', { name: /whatsapp/i })
    .first()
    .click()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(1500)

  const combined = await rows(page).count()
  expect(combined).toBeLessThanOrEqual(searched)

  await page.locator('[data-slot="table-search"] input').first().fill('')
  await page.waitForTimeout(1500)

  await expect.poll(() => rows(page).count()).toBe(2)
  for (const name of ['Ana', 'Bruno']) {
    await expect(page.getByText(name, { exact: false }).first()).toBeVisible()
  }
})

test('pressing / from anywhere focuses the table search', async ({ page }) => {
  await openContacts(page)
  await page.locator('body').click({ position: { x: 700, y: 300 } })

  await page.keyboard.press('/')

  const search = page.locator('[data-slot="table-search"] input').first()
  await expect(search).toBeFocused()

  await page.keyboard.type('bruno')
  await page.waitForTimeout(1300)
  await expect.poll(() => rows(page).count()).toBe(1)
})

test('pressing N opens the create form and Escape closes it', async ({ page }) => {
  await openContacts(page)
  await page.locator('body').click({ position: { x: 700, y: 300 } })

  await page.keyboard.press('n')

  const form = page.locator('[data-slot="sheet-content"]')
  await expect(form).toBeVisible({ timeout: 15_000 })
  await expect(form).toContainText(/contacto/i)

  await page.keyboard.press('Escape')
  await expect(form).toHaveCount(0, { timeout: 15_000 })
})

test('pressing ? opens the shortcuts help and lists real key bindings', async ({ page }) => {
  await openContacts(page)
  await page.locator('body').click({ position: { x: 700, y: 300 } })

  await page.keyboard.press('?')

  const help = page.getByRole('dialog').filter({ hasText: /atajos de teclado/i })
  await expect(help).toBeVisible({ timeout: 15_000 })
  await expect(help.getByText('Crear un registro')).toBeVisible()
  await expect(help.locator('kbd').first()).not.toBeEmpty()

  await page.keyboard.press('Escape')
  await expect(help).toHaveCount(0)
})

test('the row menu reaches the actions that row supports', async ({ page }) => {
  await openContacts(page)

  const row = page.getByRole('row').filter({ hasText: 'Ana' }).first()
  await row
    .getByRole('button', { name: /acciones/i })
    .first()
    .click()

  const menu = page.getByRole('dialog').last()
  for (const label of ['Abrir y editar', 'Llamar', 'Enviar SMS', 'Escribir email', 'Crear tarea']) {
    await expect(menu.getByText(label, { exact: true })).toBeVisible()
  }

  await menu.getByText('Crear tarea', { exact: true }).click()
  await expect(page.getByText(/tarea para/i).first()).toBeVisible({ timeout: 15_000 })
})

test('column widths survive a reload', async ({ page }) => {
  await openContacts(page)

  const widthOf = () =>
    page.evaluate(() => {
      const th = document.querySelector('[data-slot="table-root"] th:nth-child(2)')
      return th ? Math.round(th.getBoundingClientRect().width) : 0
    })

  const before = await widthOf()
  const target = page
    .locator('[data-slot="table-root"] th')
    .nth(1)
    .getByRole('slider', { name: /ancho/i })
    .first()
  await expect(target).toHaveCount(1)

  const box = await target.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(box!.x + 120, box!.y + box!.height / 2, { steps: 12 })
  await page.mouse.up()
  await page.waitForTimeout(2500)

  const resized = await widthOf()
  expect(resized).toBeGreaterThan(before)

  await page.reload()
  await openContacts(page)
  await expect.poll(widthOf, { timeout: 15_000 }).toBeGreaterThan(before)
})
