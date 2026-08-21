import { expect, test, type APIResponse, type Page } from '@playwright/test'

import { loginAs, onboardWorkspace, type Workspace } from './fixtures/tenant'

const API = process.env.E2E_API_URL ?? 'http://localhost:8080/api/v1'

test.use({ locale: 'es-CO' })

interface SectorPack {
  readonly sector: string
  readonly plural: string
  readonly pipeline: string
  readonly tag: string
  readonly contactField: string
  readonly lifecycleKey: string
}

const PACKS: readonly SectorPack[] = [
  {
    sector: 'tecnologia',
    plural: 'Leads',
    pipeline: 'Ventas B2B',
    tag: 'Riesgo de churn',
    contactField: 'rol_decision',
    lifecycleKey: 'mql',
  },
  {
    sector: 'comercio',
    plural: 'Clientes',
    pipeline: 'Ventas',
    tag: 'Mayorista',
    contactField: 'frecuencia_compra',
    lifecycleKey: 'cliente_vip',
  },
  {
    sector: 'salud',
    plural: 'Pacientes',
    pipeline: 'Atención de pacientes',
    tag: 'Urgencia',
    contactField: 'eps',
    lifecycleKey: 'en_tratamiento',
  },
]

async function json<T>(response: APIResponse): Promise<T> {
  expect(response.ok(), await response.text()).toBe(true)
  return ((await response.json()) as { data: T }).data
}

function get(page: Page, workspace: Workspace, path: string): Promise<APIResponse> {
  return page.request.get(`${API}${path}`, { headers: { 'x-tenant-slug': workspace.slug } })
}

test('provisions three industries concurrently, each with its own starter pack', async ({
  browser,
  request,
}) => {
  const workspaces = await Promise.all(PACKS.map(() => onboardWorkspace(request)))
  const contexts = await Promise.all(PACKS.map(() => browser.newContext()))
  const pages = await Promise.all(contexts.map((context) => context.newPage()))

  await Promise.all(pages.map((page, index) => loginAs(page, workspaces[index]!)))

  const patches = await Promise.all(
    PACKS.map((pack, index) =>
      pages[index]!.request.patch(`${API}/settings/general`, {
        headers: { 'x-tenant-slug': workspaces[index]!.slug },
        data: { industry: { sector: pack.sector } },
      }),
    ),
  )
  for (const patch of patches) expect(patch.ok(), await patch.text()).toBe(true)

  for (const [index, pack] of PACKS.entries()) {
    const page = pages[index]!
    const workspace = workspaces[index]!

    const nomenclature = await json<{ contact: { plural: string } }>(
      await get(page, workspace, '/settings/nomenclature'),
    )
    expect(nomenclature.contact.plural).toBe(pack.plural)

    const taxonomy = await json<{ lifecycleStages: Array<{ key: string }> }>(
      await get(page, workspace, '/settings/contact-taxonomy'),
    )
    expect(taxonomy.lifecycleStages.map((s) => s.key)).toContain(pack.lifecycleKey)

    const fields = await json<Array<{ key: string }>>(
      await get(page, workspace, '/settings/custom-fields/contacts'),
    )
    expect(fields.map((f) => f.key)).toContain(pack.contactField)

    const tags = await json<{ data?: Array<{ name: string }> } | Array<{ name: string }>>(
      await get(page, workspace, '/tags?entityType=contact&limit=50'),
    )
    const tagNames = (Array.isArray(tags) ? tags : (tags.data ?? [])).map((t) => t.name)
    expect(tagNames).toContain(pack.tag)

    const pipelines = await json<Array<{ name: string }>>(
      await get(page, workspace, '/settings/pipelines'),
    )
    expect(pipelines).toHaveLength(1)
    expect(pipelines[0]!.name).toBe(pack.pipeline)
  }

  const crossTenant = await pages[0]!.request.get(`${API}/settings/nomenclature`, {
    headers: { 'x-tenant-slug': workspaces[2]!.slug },
  })
  expect(crossTenant.ok()).toBe(false)

  await Promise.all(contexts.map((context) => context.close()))
})
