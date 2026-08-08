import { GeoService } from '../services/geo.service'

function buildQueryBuilderMock() {
  const qb = {
    select: jest.fn(),
    addSelect: jest.fn(),
    distinct: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    setParameter: jest.fn(),
    orderBy: jest.fn(),
    addOrderBy: jest.fn(),
    limit: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue([]),
  }
  for (const key of Object.keys(qb) as Array<keyof typeof qb>) {
    if (key !== 'getRawMany') qb[key].mockReturnValue(qb)
  }
  return qb
}

function buildRepoMock(qb: ReturnType<typeof buildQueryBuilderMock>) {
  return { createQueryBuilder: jest.fn().mockReturnValue(qb) }
}

describe('GeoService', () => {
  let qb: ReturnType<typeof buildQueryBuilderMock>
  let service: GeoService

  beforeEach(() => {
    qb = buildQueryBuilderMock()
    service = new GeoService(buildRepoMock(qb) as never)
  })

  describe('listDepartments', () => {
    it('selects distinct department code and name ordered by name', async () => {
      qb.getRawMany.mockResolvedValue([{ code: '11', name: 'Bogotá D.C.' }])

      const result = await service.listDepartments()

      expect(qb.distinct).toHaveBeenCalledWith(true)
      expect(qb.orderBy).toHaveBeenCalledWith('m.department', 'ASC')
      expect(result).toEqual([{ code: '11', name: 'Bogotá D.C.' }])
    })
  })

  describe('searchMunicipalities', () => {
    it('normalizes the search term before building the WHERE clause', async () => {
      await service.searchMunicipalities('Bogotá')

      expect(qb.where).toHaveBeenCalledWith('m.search_name LIKE :anywhere', {
        anywhere: '%bogota%',
      })
      expect(qb.setParameter).toHaveBeenCalledWith('prefix', 'bogota%')
    })

    it('ranks prefix matches above substring matches when a term is present', async () => {
      await service.searchMunicipalities('cali')

      expect(qb.addSelect).toHaveBeenCalledWith(
        'CASE WHEN m.search_name LIKE :prefix THEN 0 ELSE 1 END',
        'match_rank',
      )
      expect(qb.orderBy).toHaveBeenCalledWith('match_rank', 'ASC')
    })

    it('does not filter or rank when the term is empty', async () => {
      await service.searchMunicipalities('')

      expect(qb.where).not.toHaveBeenCalled()
      expect(qb.addSelect).not.toHaveBeenCalledWith(
        'CASE WHEN m.search_name LIKE :prefix THEN 0 ELSE 1 END',
        'match_rank',
      )
    })

    it('filters by department code when provided', async () => {
      await service.searchMunicipalities('cali', '76')

      expect(qb.andWhere).toHaveBeenCalledWith('m.department_code = :departmentCode', {
        departmentCode: '76',
      })
    })

    it('does not filter by department when omitted', async () => {
      await service.searchMunicipalities('cali')

      expect(qb.andWhere).not.toHaveBeenCalled()
    })

    it('always orders by name and limits results', async () => {
      await service.searchMunicipalities('cali')

      expect(qb.addOrderBy).toHaveBeenCalledWith('m.name', 'ASC')
      expect(qb.limit).toHaveBeenCalledWith(10)
    })

    it('returns the raw rows from the query builder', async () => {
      const rows = [
        { code: '76001', name: 'Cali', departmentCode: '76', department: 'Valle del Cauca' },
      ]
      qb.getRawMany.mockResolvedValue(rows)

      const result = await service.searchMunicipalities('cali')

      expect(result).toEqual(rows)
    })
  })
})
