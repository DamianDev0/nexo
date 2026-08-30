import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'
import { DEFAULT_CONTACT_TAXONOMY } from '@repo/shared-types'

const SLUG_CLINIC = 'e2e-clinica-salud'
const SLUG_PLAIN = 'e2e-crm-generico'

const CLINIC_CSV = [
  'Nombre mascota,Correo dueño,Fecha última visita,¿Vacunado?,Peso,Teléfono emergencia',
  'Rocky,laura@mail.co,15/03/2026,Sí,12.5,300 123 4567',
  'Luna,carlos@mail.co,02/01/2026,No,4.2,+57 301 555 1234',
].join('\n')

describe('Industry adaptability (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let clinic: OnboardedTenant
  let plain: OnboardedTenant

  const server = () => app.getHttpServer()

  beforeAll(async () => {
    ctx = await createTestApp()
    app = ctx.app
    await teardownTenants(ctx, [SLUG_CLINIC, SLUG_PLAIN])
    clinic = await onboardTenant(app, SLUG_CLINIC)
    plain = await onboardTenant(app, SLUG_PLAIN)

    await asTenant(request(server()).patch(`/${API_PREFIX}/settings/general`), clinic)
      .send({ industry: { sector: 'salud' } })
      .expect(200)
  })

  afterAll(async () => {
    if (process.env.E2E_KEEP_TENANTS !== '1') {
      await teardownTenants(ctx, [SLUG_CLINIC, SLUG_PLAIN])
    }
    await app.close()
  })

  it('renames entities per tenant: clinic speaks in patients, plain tenant keeps defaults', async () => {
    const clinicNames = await asTenant(
      request(server()).get(`/${API_PREFIX}/settings/nomenclature`),
      clinic,
    ).expect(200)
    expect(clinicNames.body.data.contact).toEqual({ singular: 'Paciente', plural: 'Pacientes' })
    expect(clinicNames.body.data.deal).toEqual({ singular: 'Cita', plural: 'Citas' })

    const plainNames = await asTenant(
      request(server()).get(`/${API_PREFIX}/settings/nomenclature`),
      plain,
    ).expect(200)
    expect(plainNames.body.data.contact.singular).toBe('Contacto')
  })

  it('replaces the sales lifecycle with a clinical one, only for the clinic', async () => {
    const clinicTaxonomy = await asTenant(
      request(server()).get(`/${API_PREFIX}/settings/contact-taxonomy`),
      clinic,
    ).expect(200)
    const clinicStages = (clinicTaxonomy.body.data.lifecycleStages as Array<{ key: string }>).map(
      (s) => s.key,
    )
    expect(clinicStages).toEqual([
      'interesado',
      'paciente_nuevo',
      'en_tratamiento',
      'paciente_recurrente',
      'alta',
      'inactivo',
    ])

    const plainTaxonomy = await asTenant(
      request(server()).get(`/${API_PREFIX}/settings/contact-taxonomy`),
      plain,
    ).expect(200)
    const plainStages = (plainTaxonomy.body.data.lifecycleStages as Array<{ key: string }>).map(
      (s) => s.key,
    )
    expect(plainStages).toEqual(DEFAULT_CONTACT_TAXONOMY.lifecycleStages.map((s) => s.key))
  })

  it('ships clinical custom fields on contacts and deals', async () => {
    const contactFields = await asTenant(
      request(server()).get(`/${API_PREFIX}/settings/custom-fields/contacts`),
      clinic,
    ).expect(200)
    const contactKeys = (contactFields.body.data as Array<{ key: string }>).map((f) => f.key)
    expect(contactKeys).toEqual(
      expect.arrayContaining(['eps', 'tipo_sangre', 'alergias', 'contacto_emergencia']),
    )

    const dealFields = await asTenant(
      request(server()).get(`/${API_PREFIX}/settings/custom-fields/deals`),
      clinic,
    ).expect(200)
    const copago = (dealFields.body.data as Array<{ key: string; type: string }>).find(
      (f) => f.key === 'copago',
    )
    expect(copago?.type).toBe('currency')
  })

  it('derives sidebar labels from the clinical nomenclature', async () => {
    const nav = await asTenant(
      request(server()).get(`/${API_PREFIX}/settings/navigation`),
      clinic,
    ).expect(200)
    const labels = Object.fromEntries(
      (nav.body.data.modules as Array<{ key: string; label: string }>).map((m) => [
        m.key,
        m.label,
      ]),
    )
    expect(labels.contacts).toBe('Pacientes')
    expect(labels.deals).toBe('Citas')
    expect(labels.companies).toBe('Clínicas')
  })

  it('creates the clinical pipeline instead of a sales one', async () => {
    const pipelines = await asTenant(
      request(server()).get(`/${API_PREFIX}/settings/pipelines`),
      clinic,
    ).expect(200)
    const names = (pipelines.body.data as Array<{ name: string }>).map((p) => p.name)
    expect(names).toContain('Atención de pacientes')
  })

  it('accepts clinical lifecycle stages on contacts and rejects the sales ones', async () => {
    await asTenant(request(server()).post(`/${API_PREFIX}/contacts`), clinic)
      .send({ firstName: 'Laura', lastName: 'Paciente', lifecycleStage: 'paciente_nuevo' })
      .expect(201)

    await asTenant(request(server()).post(`/${API_PREFIX}/contacts`), clinic)
      .send({ firstName: 'Juan', lastName: 'Vendedor', lifecycleStage: 'lead' })
      .expect(400)
  })

  it('suggests typed field definitions from a clinic spreadsheet', async () => {
    const analysis = await asTenant(
      request(server()).post(`/${API_PREFIX}/settings/custom-fields/contacts/analyze-headers`),
      clinic,
    )
      .attach('file', Buffer.from(CLINIC_CSV, 'utf8'), 'pacientes.csv')
      .expect(201)

    const byColumn = Object.fromEntries(
      (
        analysis.body.data.suggestions as Array<{
          column: string
          suggestedKey: string
          suggestedType: string
        }>
      ).map((s) => [s.column, s]),
    )
    expect(byColumn['Nombre mascota']).toMatchObject({
      suggestedKey: 'nombre_mascota',
      suggestedType: 'text',
    })
    expect(byColumn['Correo dueño']).toMatchObject({
      suggestedKey: 'correo_dueno',
      suggestedType: 'email',
    })
    expect(byColumn['Fecha última visita'].suggestedType).toBe('date')
    expect(byColumn['¿Vacunado?'].suggestedType).toBe('boolean')
    expect(byColumn['Peso'].suggestedType).toBe('number')
    expect(byColumn['Teléfono emergencia'].suggestedType).toBe('phone')
  })

  it('supports required custom fields without breaking partial updates', async () => {
    await asTenant(
      request(server()).patch(`/${API_PREFIX}/settings/custom-fields/contacts/eps`),
      clinic,
    )
      .send({ required: true })
      .expect(200)

    const created = await asTenant(request(server()).post(`/${API_PREFIX}/contacts`), clinic)
      .send({
        firstName: 'Marta',
        lastName: 'Requerida',
        customFields: { eps: 'Sura' },
      })
      .expect(201)
    const contactId = created.body.data.id as string
    expect(created.body.data.customFields).toMatchObject({ eps: 'Sura' })

    await asTenant(request(server()).post(`/${API_PREFIX}/contacts`), clinic)
      .send({ firstName: 'Sin', lastName: 'Eps' })
      .expect(400)

    const phonePatched = await asTenant(
      request(server()).patch(`/${API_PREFIX}/contacts/${contactId}`),
      clinic,
    )
      .send({ phone: '3001234567' })
      .expect(200)
    expect(phonePatched.body.data.customFields).toMatchObject({ eps: 'Sura' })

    const patched = await asTenant(
      request(server()).patch(`/${API_PREFIX}/contacts/${contactId}`),
      clinic,
    )
      .send({ customFields: { alergias: 'Polen' } })
      .expect(200)
    expect(patched.body.data.customFields).toMatchObject({ eps: 'Sura', alergias: 'Polen' })
  })

  it('exposes reachable field permission routes', async () => {
    await asTenant(
      request(server()).patch(`/${API_PREFIX}/settings/custom-fields/permissions/contacts`),
      clinic,
    )
      .send({ permissions: [{ key: 'eps', visibility: 'all', editable: 'manager_plus' }] })
      .expect(200)

    const perms = await asTenant(
      request(server()).get(`/${API_PREFIX}/settings/custom-fields/permissions/contacts`),
      clinic,
    ).expect(200)
    expect(perms.body.data.eps).toEqual({ visibility: 'all', editable: 'manager_plus' })
  })
})
