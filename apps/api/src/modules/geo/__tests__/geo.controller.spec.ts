import { Test } from '@nestjs/testing'
import { GeoController } from '../controllers/geo.controller'
import { AddressAutocompleteService } from '../services/address-autocomplete.service'
import { GeoService } from '../services/geo.service'

function buildServiceMock() {
  return {
    listDepartments: jest.fn(),
    searchMunicipalities: jest.fn(),
  }
}

function buildAddressesMock() {
  return { suggest: jest.fn() }
}

describe('GeoController', () => {
  let controller: GeoController
  let service: ReturnType<typeof buildServiceMock>
  let addresses: ReturnType<typeof buildAddressesMock>

  beforeEach(async () => {
    service = buildServiceMock()
    addresses = buildAddressesMock()

    const module = await Test.createTestingModule({
      controllers: [GeoController],
      providers: [
        { provide: GeoService, useValue: service },
        { provide: AddressAutocompleteService, useValue: addresses },
      ],
    }).compile()

    controller = module.get(GeoController)
  })

  describe('listDepartments', () => {
    it('delegates to the service', async () => {
      const departments = [{ code: '11', name: 'Bogotá D.C.' }]
      service.listDepartments.mockResolvedValue(departments)

      const result = await controller.listDepartments()

      expect(service.listDepartments).toHaveBeenCalled()
      expect(result).toEqual(departments)
    })
  })

  describe('searchMunicipalities', () => {
    it('delegates to the service with the query and department', async () => {
      const municipalities = [
        { code: '76001', name: 'Cali', departmentCode: '76', department: 'Valle' },
      ]
      service.searchMunicipalities.mockResolvedValue(municipalities)

      const result = await controller.searchMunicipalities('cali', '76')

      expect(service.searchMunicipalities).toHaveBeenCalledWith('cali', '76')
      expect(result).toEqual(municipalities)
    })

    it('defaults the query to an empty string when omitted', async () => {
      service.searchMunicipalities.mockResolvedValue([])

      await controller.searchMunicipalities(undefined)

      expect(service.searchMunicipalities).toHaveBeenCalledWith('', undefined)
    })
  })

  describe('suggestAddresses', () => {
    it('delegates to the autocomplete service with input and session token', async () => {
      const suggestions = [{ description: 'Carrera 45 #26-85, Bogotá', placeId: 'abc123' }]
      addresses.suggest.mockResolvedValue(suggestions)

      const result = await controller.suggestAddresses({
        q: 'carrera 45',
        sessionToken: 'f4a4dd50-52c8-4b3c-9d6e-2f1a3b4c5d6e',
      })

      expect(addresses.suggest).toHaveBeenCalledWith(
        'carrera 45',
        'f4a4dd50-52c8-4b3c-9d6e-2f1a3b4c5d6e',
      )
      expect(result).toEqual(suggestions)
    })
  })
})
