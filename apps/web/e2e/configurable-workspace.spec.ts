import { expect, test, type APIResponse, type Page } from '@playwright/test'

import { dismissDevOverlay } from './fixtures/contacts'
import { loginAs, onboardWorkspace, type Workspace } from './fixtures/tenant'

const API = process.env.E2E_API_URL ?? 'http://localhost:8080/api/v1'

test.describe.configure({ mode: 'serial' })
test.use({ locale: 'es-CO' })

let workspace: Workspace

async function json<T>(response: APIResponse): Promise<T> {
  expect(response.ok(), await response.text()).toBe(true)
  return ((await response.json()) as { data: T }).data
}

function headers(): Record<string, string> {
  return { 'x-tenant-slug': workspace.slug }
}

async function openNewContactSheet(page: Page): Promise<void> {
  await page.goto('/contacts')
  await dismissDevOverlay(page)
  await expect(page.locator('[data-slot="table-smart-lists"]')).toBeVisible()
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Paciente' }).click()
}

test.describe('workspace › configurable CRM', () => {
  test.beforeAll(async ({ request }) => {
    workspace = await onboardWorkspace(request)
  })

  test.beforeEach(async ({ page }) => {
    await loginAs(page, workspace)
  })

  test('picking an industry materialises the workspace from the backend', async ({ page }) => {
    const patched = await page.request.patch(`${API}/settings/general`, {
      headers: headers(),
      data: { industry: { sector: 'salud' } },
    })
    expect(patched.ok(), await patched.text()).toBe(true)

    const nomenclature = await json<{ contact: { singular: string; plural: string } }>(
      await page.request.get(`${API}/settings/nomenclature`, { headers: headers() }),
    )
    expect(nomenclature.contact).toMatchObject({ singular: 'Paciente', plural: 'Pacientes' })

    const taxonomy = await json<{ lifecycleStages: Array<{ key: string }> }>(
      await page.request.get(`${API}/settings/contact-taxonomy`, { headers: headers() }),
    )
    expect(taxonomy.lifecycleStages.map((stage) => stage.key)).toContain('en_tratamiento')

    const pipelines = await json<Array<{ name: string; stages: unknown[] }>>(
      await page.request.get(`${API}/settings/pipelines`, { headers: headers() }),
    )
    expect(pipelines).toHaveLength(1)
    expect(pipelines[0]!.name).toBe('Atención de pacientes')
    expect(pipelines[0]!.stages).toHaveLength(5)

    await openNewContactSheet(page)
    await expect(page.getByRole('heading', { name: 'Nuevo Paciente' })).toBeVisible()
  })

  test('re-applying a different sector never overwrites existing configuration', async ({
    page,
  }) => {
    const patched = await page.request.patch(`${API}/settings/general`, {
      headers: headers(),
      data: { industry: { sector: 'tecnologia' } },
    })
    expect(patched.ok(), await patched.text()).toBe(true)

    const nomenclature = await json<{ contact: { singular: string } }>(
      await page.request.get(`${API}/settings/nomenclature`, { headers: headers() }),
    )
    expect(nomenclature.contact.singular).toBe('Paciente')

    const pipelines = await json<Array<{ name: string }>>(
      await page.request.get(`${API}/settings/pipelines`, { headers: headers() }),
    )
    expect(pipelines).toHaveLength(1)
  })

  test('renaming a lifecycle stage in the backend repaints filters and settings', async ({
    page,
  }) => {
    const taxonomy = await json<{
      statuses: unknown[]
      sources: unknown[]
      types: unknown[]
      lifecycleStages: Array<{ key: string; label: string | null }>
    }>(await page.request.get(`${API}/settings/contact-taxonomy`, { headers: headers() }))

    const renamed = {
      ...taxonomy,
      lifecycleStages: taxonomy.lifecycleStages.map((stage) =>
        stage.key === 'interesado' ? { ...stage, label: 'Lead entrante' } : stage,
      ),
    }
    const patched = await page.request.patch(`${API}/settings/contact-taxonomy`, {
      headers: headers(),
      data: renamed,
    })
    expect(patched.ok(), await patched.text()).toBe(true)

    await page.goto('/contacts')
    await dismissDevOverlay(page)
    await page.getByRole('button', { name: 'Ciclo de vida' }).click()
    await expect(page.getByRole('menuitem', { name: 'Lead entrante' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'En tratamiento' })).toBeVisible()

    await page.goto('/settings/contacts/lifecycle')
    await dismissDevOverlay(page)
    await expect(page.getByRole('heading', { name: 'Pacientes' })).toBeVisible()
    await expect(page.getByText('Lead entrante')).toBeVisible()
  })

  test('a custom field created in Settings appears in the form and reaches the API', async ({
    page,
  }) => {
    await page.goto('/settings/fields')
    await dismissDevOverlay(page)

    await page.getByRole('button', { name: 'Agregar' }).click()
    await expect(page.getByRole('heading', { name: 'Nuevo campo' })).toBeVisible()
    await page.getByLabel('Nombre del campo').fill('Metros cuadrados')
    await page.getByLabel('Tipo de campo').click()
    await page.getByRole('option', { name: 'Número' }).click()

    const created = page.waitForResponse(
      (res) => res.url().includes('/settings/custom-fields/contacts') && res.status() === 201,
    )
    await page.getByRole('button', { name: 'Crear' }).click()
    await created
    await expect(page.getByText('Metros cuadrados')).toBeVisible()

    await openNewContactSheet(page)
    await expect(page.getByText('Campos personalizados')).toBeVisible()

    await page.locator('input[name="firstName"]').fill('Julia')
    await page.getByLabel('Metros cuadrados').fill('120')

    const posted = page.waitForRequest(
      (req) => req.url().endsWith('/contacts') && req.method() === 'POST',
    )
    await page.getByRole('button', { name: /^Crear Paciente/i }).click()
    const body = (await posted).postDataJSON() as { customFields?: Record<string, unknown> }
    expect(body.customFields).toEqual({ metros_cuadrados: 120 })

    await expect(page.getByText('Julia')).toBeVisible()
  })
})
