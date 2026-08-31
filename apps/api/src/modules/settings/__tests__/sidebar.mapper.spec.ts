import { withModuleStatus } from '../mappers/sidebar.mapper'
import { sidebarModule } from '@/shared/testing/sidebar.factory'

describe('withModuleStatus', () => {
  it('marks built modules as available', () => {
    const result = withModuleStatus({ modules: [sidebarModule('contacts')] })

    expect(result.modules[0]?.status).toBe('available')
  })

  it('marks modules without a UI as coming_soon', () => {
    const result = withModuleStatus({ modules: [sidebarModule('deals')] })

    expect(result.modules[0]?.status).toBe('coming_soon')
  })

  it('treats unknown module keys as coming_soon', () => {
    const result = withModuleStatus({ modules: [sidebarModule('made-up')] })

    expect(result.modules[0]?.status).toBe('coming_soon')
  })

  it('overrides a client-supplied status instead of trusting it', () => {
    const spoofed = sidebarModule('deals', { status: 'available' })

    const result = withModuleStatus({ modules: [spoofed] })

    expect(result.modules[0]?.status).toBe('coming_soon')
  })

  it('preserves every other module property', () => {
    const module = sidebarModule('contacts', { order: 7, enabled: false, label: 'Pacientes' })

    const result = withModuleStatus({ modules: [module] })

    expect(result.modules[0]).toMatchObject({ order: 7, enabled: false, label: 'Pacientes' })
  })
})
