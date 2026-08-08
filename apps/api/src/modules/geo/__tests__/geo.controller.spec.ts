import { Test } from '@nestjs/testing'
import { GeoController } from '../controllers/geo.controller'
import { GeoService } from '../services/geo.service'

function buildServiceMock() {
  return {
    listDepartments: jest.fn(),
    searchMunicipalities: jest.fn(),
  }
}

describe('GeoController', () => {
  let controller: GeoController
  let service: ReturnType<typeof buildServiceMock>

  beforeEach(async () => {
    service = buildServiceMock()

    const module = await Test.createTestingModule({
      controllers: [GeoController],
      providers: [{ provide: GeoService, useValue: service }],
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
})
