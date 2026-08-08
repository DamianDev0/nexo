import { BadRequestException, ServiceUnavailableException } from '@nestjs/common'

const mockSend = jest.fn()

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  PutObjectCommand: jest.fn((input: unknown) => ({ input })),
  GetObjectCommand: jest.fn((input: unknown) => ({ input })),
  DeleteObjectCommand: jest.fn((input: unknown) => ({ input })),
}))

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://signed.example.com/file'),
}))

const MOCK_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
jest.mock('uuid', () => ({ v4: jest.fn(() => MOCK_UUID) }))

import { S3Service } from '../s3.service'
import { S3Category } from '../s3.types'
import type { MulterFile } from '../s3.types'

const CONFIG_VALUES: Record<string, string> = {
  AWS_REGION: 'us-east-1',
  AWS_ACCESS_KEY_ID: 'AKIA-fake',
  AWS_SECRET_ACCESS_KEY: 'secret-fake',
  AWS_S3_BUCKET: 'nexo-bucket',
}

function buildConfigMock(cdnUrl?: string) {
  return {
    getOrThrow: jest.fn((key: string) => CONFIG_VALUES[key]),
    get: jest.fn((key: string) => (key === 'AWS_CLOUDFRONT_URL' ? cdnUrl : undefined)),
  }
}

function makeFile(overrides: Partial<MulterFile> = {}): MulterFile {
  return {
    fieldname: 'file',
    originalname: 'logo.png',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('fake-image-bytes'),
    ...overrides,
  }
}

describe('S3Service', () => {
  beforeEach(() => {
    mockSend.mockReset()
  })

  describe('upload validation', () => {
    let service: S3Service

    beforeEach(() => {
      service = new S3Service(buildConfigMock() as never)
    })

    it('rejects a file larger than the category max size', async () => {
      const file = makeFile({ size: 5 * 1024 * 1024 })

      await expect(service.upload(file, S3Category.TENANT_LOGO, 'acme')).rejects.toThrow(
        BadRequestException,
      )
      await expect(service.upload(file, S3Category.TENANT_LOGO, 'acme')).rejects.toThrow(
        /too large/i,
      )
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('rejects a mimetype not allowed for the category', async () => {
      const file = makeFile({ mimetype: 'application/zip', originalname: 'archive.zip' })

      await expect(service.upload(file, S3Category.TENANT_LOGO, 'acme')).rejects.toThrow(
        BadRequestException,
      )
      await expect(service.upload(file, S3Category.TENANT_LOGO, 'acme')).rejects.toThrow(
        /Invalid file type/,
      )
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('rejects an extension not allowed for the category, even with an allowed mimetype', async () => {
      const file = makeFile({ mimetype: 'image/png', originalname: 'logo.exe' })

      await expect(service.upload(file, S3Category.TENANT_LOGO, 'acme')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('rejects a file with no buffer', async () => {
      const file = makeFile({ buffer: undefined as unknown as Buffer })

      await expect(service.upload(file, S3Category.TENANT_LOGO, 'acme')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('accepts a file within the size and mimetype constraints', async () => {
      mockSend.mockResolvedValue({})
      const file = makeFile()

      const result = await service.upload(file, S3Category.TENANT_LOGO, 'acme')

      expect(result.mimeType).toBe('image/png')
      expect(result.sizeBytes).toBe(file.size)
      expect(mockSend).toHaveBeenCalledTimes(1)
    })
  })

  describe('upload failure', () => {
    it('throws ServiceUnavailableException when the S3 client rejects', async () => {
      const service = new S3Service(buildConfigMock() as never)
      mockSend.mockRejectedValue(new Error('network down'))

      await expect(service.upload(makeFile(), S3Category.TENANT_LOGO, 'acme')).rejects.toThrow(
        ServiceUnavailableException,
      )
    })

    it('does not leak the underlying AWS error message to the caller', async () => {
      const service = new S3Service(buildConfigMock() as never)
      mockSend.mockRejectedValue(new Error('AccessDenied: secret leaked in message'))

      await expect(service.upload(makeFile(), S3Category.TENANT_LOGO, 'acme')).rejects.toThrow(
        'File storage is unavailable, nothing was saved',
      )
    })
  })

  describe('key and url building', () => {
    it('builds a slugified, unique key under the category path prefix', async () => {
      mockSend.mockResolvedValue({})
      const service = new S3Service(buildConfigMock() as never)

      const result = await service.upload(
        makeFile({ originalname: 'My Cool Logo!!.png' }),
        S3Category.TENANT_LOGO,
        'acme',
      )

      expect(result.key).toBe(`acme/branding/${MOCK_UUID}-my-cool-logo.png`)
    })

    it('builds a plain S3 URL when no CDN is configured', async () => {
      mockSend.mockResolvedValue({})
      const service = new S3Service(buildConfigMock() as never)

      const result = await service.upload(makeFile(), S3Category.TENANT_LOGO, 'acme')

      expect(result.url).toBe(`https://nexo-bucket.s3.us-east-1.amazonaws.com/${result.key}`)
    })

    it('builds a CDN-backed URL when a CloudFront domain is configured', async () => {
      mockSend.mockResolvedValue({})
      const service = new S3Service(buildConfigMock('https://cdn.nexo.co') as never)

      const result = await service.upload(makeFile(), S3Category.TENANT_LOGO, 'acme')

      expect(result.url).toBe(`https://cdn.nexo.co/${result.key}`)
    })
  })

  describe('extractKey', () => {
    it('strips the plain S3 base URL', () => {
      const service = new S3Service(buildConfigMock() as never)
      const key = service.extractKey('https://nexo-bucket.s3.us-east-1.amazonaws.com/acme/logo.png')
      expect(key).toBe('acme/logo.png')
    })

    it('strips the CDN base URL when configured', () => {
      const service = new S3Service(buildConfigMock('https://cdn.nexo.co') as never)
      const key = service.extractKey('https://cdn.nexo.co/acme/logo.png')
      expect(key).toBe('acme/logo.png')
    })
  })
})
