import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Readable } from 'node:stream'
import { v4 as uuidv4 } from 'uuid'
import type { MulterFile, S3Category, UploadResult } from './s3.types'
import { S3_CATEGORY_CONFIG } from './s3.types'

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name)
  private readonly client: S3Client
  private readonly bucket: string
  private readonly region: string
  private readonly cdnUrl: string | undefined

  constructor(private readonly config: ConfigService) {
    const region = this.config.getOrThrow<string>('AWS_REGION')
    const accessKeyId = this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID')
    const secretAccessKey = this.config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY')
    const bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET')

    this.client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    })

    this.bucket = bucket
    this.region = region
    this.cdnUrl = this.config.get<string>('AWS_CLOUDFRONT_URL')

    this.logger.log(`S3Service ready — bucket: ${bucket}, region: ${region}`)
  }

  // ─── Upload ───────────────────────────────────────────────────────────────

  async upload(file: MulterFile, category: S3Category, tenantSlug: string): Promise<UploadResult> {
    const cfg = S3_CATEGORY_CONFIG[category]

    this.validateFile(file, cfg.allowedMimeTypes, cfg.allowedExtensions, cfg.maxSizeBytes)

    const key = this.buildKey(file.originalname, cfg.pathPrefix(tenantSlug))

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    )

    const url = this.buildUrl(key)
    this.logger.log(`Uploaded [${category}] → ${url}`)

    return { url, key, sizeBytes: file.size, mimeType: file.mimetype }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    this.logger.log(`Deleted → ${key}`)
  }

  // ─── Presigned URL (for private files) ───────────────────────────────────

  async presignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn,
    })
  }

  // ─── Download buffer ──────────────────────────────────────────────────────

  async download(key: string): Promise<Buffer> {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }))
    const stream = response.Body as Readable
    const chunks: Buffer[] = []
    for await (const chunk of stream) chunks.push(Buffer.from(chunk as Uint8Array))
    return Buffer.concat(chunks)
  }

  // ─── Key extractor (from full URL → S3 key) ──────────────────────────────

  extractKey(url: string): string {
    const base = this.cdnUrl ?? `https://${this.bucket}.s3.${this.region}.amazonaws.com`
    return url.replaceAll(`${base}/`, '')
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private validateFile(
    file: MulterFile,
    allowedMimeTypes: string[],
    allowedExtensions: string[],
    maxSizeBytes: number,
  ): void {
    if (!file?.buffer) throw new BadRequestException('No file received')

    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `File too large. Max allowed: ${Math.round(maxSizeBytes / 1024 / 1024)} MB`,
      )
    }

    const name = file.originalname.toLowerCase()
    const dotIdx = name.lastIndexOf('.')
    const ext = dotIdx >= 0 ? name.slice(dotIdx) : ''

    if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(ext)) {
      throw new BadRequestException(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`)
    }
  }

  private buildKey(originalName: string, prefix: string): string {
    const lower = originalName.toLowerCase()
    const dotIdx = lower.lastIndexOf('.')
    const name = dotIdx >= 0 ? originalName.slice(0, dotIdx) : originalName
    const ext = dotIdx >= 0 ? lower.slice(dotIdx) : ''
    return `${prefix}/${uuidv4()}-${this.normalize(name)}${ext}`
  }

  private buildUrl(key: string): string {
    if (this.cdnUrl) return `${this.cdnUrl}/${key}`
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
  }

  private normalize(segment: string): string {
    return segment
      .toLowerCase()
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .replaceAll(/\s+/g, '-')
      .replaceAll(/[^a-z0-9-]/g, '')
      .replaceAll(/-+/g, '-')
      .replaceAll(/^-|-$/g, '')
  }
}
