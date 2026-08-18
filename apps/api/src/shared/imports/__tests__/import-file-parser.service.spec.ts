import { BadRequestException } from '@nestjs/common'
import ExcelJS from 'exceljs'
import { ImportCsvParserService } from '../services/import-csv-parser.service'
import { ImportFileParserService } from '../services/import-file-parser.service'
import { ImportXlsxParserService } from '../services/import-xlsx-parser.service'
import { IMPORT_MAX_FILE_SIZE } from '../constants/import.constants'

const CSV = Buffer.from('Nombre,Correo\nAna,ana@empresa.co\nBeto,beto@empresa.co\n')

async function xlsxBuffer(
  rows: (string | number | null)[][],
  sheetName = 'Contactos',
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)
  rows.forEach((row) => sheet.addRow(row))
  return Buffer.from(await workbook.xlsx.writeBuffer())
}

function upload(
  name: string,
  size = 1024,
): {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
} {
  return { buffer: CSV, originalname: name, mimetype: 'application/octet-stream', size }
}

describe('ImportFileParserService', () => {
  let parser: ImportFileParserService

  beforeEach(() => {
    parser = new ImportFileParserService(
      new ImportCsvParserService(),
      new ImportXlsxParserService(),
    )
  })

  describe('validateFile', () => {
    it('accepts the formats the wizard advertises', () => {
      expect(() => parser.validateFile(upload('contactos.csv'))).not.toThrow()
      expect(() => parser.validateFile(upload('contactos.xlsx'))).not.toThrow()
      expect(() => parser.validateFile(upload('CONTACTOS.XLSX'))).not.toThrow()
    })

    it('tells the user how to fix a legacy .xls instead of just refusing it', () => {
      expect(() => parser.validateFile(upload('contactos.xls'))).toThrow(/save it as \.xlsx/)
    })

    it('rejects unrelated file types', () => {
      expect(() => parser.validateFile(upload('contactos.pdf'))).toThrow(BadRequestException)
      expect(() => parser.validateFile(upload('contactos'))).toThrow(BadRequestException)
    })

    it('rejects files over the size limit', () => {
      expect(() => parser.validateFile(upload('contactos.csv', IMPORT_MAX_FILE_SIZE + 1))).toThrow(
        /limit/,
      )
    })

    it('trusts the extension, not the browser-supplied mimetype', () => {
      const file = { ...upload('contactos.csv'), mimetype: 'application/octet-stream' }

      expect(() => parser.validateFile(file)).not.toThrow()
    })
  })

  describe('analyze', () => {
    it('reads a CSV', async () => {
      const result = await parser.analyze(CSV, 'contactos.csv')

      expect(result.columns).toEqual(['Nombre', 'Correo'])
      expect(result.totalRows).toBe(2)
      expect(result.sampleRows[0]).toEqual({ Nombre: 'Ana', Correo: 'ana@empresa.co' })
    })

    it('reads a spreadsheet the same way it reads a CSV', async () => {
      const buffer = await xlsxBuffer([
        ['Nombre', 'Correo'],
        ['Ana', 'ana@empresa.co'],
        ['Beto', 'beto@empresa.co'],
      ])

      const result = await parser.analyze(buffer, 'contactos.xlsx')

      expect(result.columns).toEqual(['Nombre', 'Correo'])
      expect(result.totalRows).toBe(2)
      expect(result.sampleRows[0]).toEqual({ Nombre: 'Ana', Correo: 'ana@empresa.co' })
    })

    it('turns spreadsheet numbers and dates into the text the mapper expects', async () => {
      const buffer = await xlsxBuffer([
        ['Nombre', 'Puntaje', 'Documento'],
        ['Ana', 82, 1000324679],
      ])

      const result = await parser.analyze(buffer, 'contactos.xlsx')

      expect(result.sampleRows[0]).toEqual({
        Nombre: 'Ana',
        Puntaje: '82',
        Documento: '1000324679',
      })
    })

    it('names unlabelled spreadsheet columns so they can still be mapped', async () => {
      const buffer = await xlsxBuffer([
        ['Nombre', ''],
        ['Ana', 'suelto'],
      ])

      const result = await parser.analyze(buffer, 'contactos.xlsx')

      expect(result.columns).toEqual(['Nombre', 'Column 2'])
    })

    it('skips blank spreadsheet rows instead of importing empty contacts', async () => {
      const buffer = await xlsxBuffer([['Nombre'], ['Ana'], [''], ['Beto']])

      const result = await parser.analyze(buffer, 'contactos.xlsx')

      expect(result.totalRows).toBe(2)
    })
  })

  describe('parseAll', () => {
    it('returns every spreadsheet row for the import', async () => {
      const buffer = await xlsxBuffer([
        ['Nombre', 'Correo'],
        ['Ana', 'ana@empresa.co'],
        ['Beto', 'beto@empresa.co'],
        ['Caro', 'caro@empresa.co'],
      ])

      const rows = await parser.parseAll(buffer, 'contactos.xlsx')

      expect(rows).toHaveLength(3)
      expect(rows[2]).toEqual({ Nombre: 'Caro', Correo: 'caro@empresa.co' })
    })

    it('refuses a spreadsheet with headers but no data', async () => {
      const buffer = await xlsxBuffer([['Nombre', 'Correo']])

      await expect(parser.parseAll(buffer, 'contactos.xlsx')).rejects.toThrow(/no data rows/)
    })

    it('refuses a file that is not really a spreadsheet', async () => {
      await expect(parser.parseAll(CSV, 'contactos.xlsx')).rejects.toThrow(/could not be read/)
    })
  })
})
