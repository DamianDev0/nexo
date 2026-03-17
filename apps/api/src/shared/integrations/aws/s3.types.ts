// ─── Multer file (avoids Express.Multer global namespace dependency) ──────────

export type MulterFile = {
  fieldname: string
  originalname: string
  mimetype: string
  size: number
  buffer: Buffer
}

// ─── Upload result ────────────────────────────────────────────────────────────

export type UploadResult = {
  /** Full public URL (or CloudFront URL when configured) */
  url: string
  /** S3 object key — store this to delete the file later */
  key: string
  sizeBytes: number
  mimeType: string
}

// ─── Categories ───────────────────────────────────────────────────────────────

export enum S3Category {
  TENANT_LOGO = 'tenant_logo',
  TENANT_FAVICON = 'tenant_favicon',
  TENANT_LOGIN_BG = 'tenant_login_bg',
  USER_AVATAR = 'user_avatar',
  CONTACT_DOCUMENT = 'contact_document',
  DEAL_ATTACHMENT = 'deal_attachment',
}

// ─── Category config ──────────────────────────────────────────────────────────

type CategoryConfig = {
  /** S3 path prefix, receives the tenant slug */
  pathPrefix: (tenantSlug: string) => string
  allowedMimeTypes: string[]
  allowedExtensions: string[]
  /** Max file size in bytes */
  maxSizeBytes: number
  /** Whether the object should be publicly readable */
  public: boolean
}

export const S3_CATEGORY_CONFIG: Record<S3Category, CategoryConfig> = {
  [S3Category.TENANT_LOGO]: {
    pathPrefix: (slug) => `${slug}/branding`,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
    public: true,
  },
  [S3Category.TENANT_FAVICON]: {
    pathPrefix: (slug) => `${slug}/branding`,
    allowedMimeTypes: ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'],
    allowedExtensions: ['.png', '.ico'],
    maxSizeBytes: 512 * 1024, // 512 KB
    public: true,
  },
  [S3Category.TENANT_LOGIN_BG]: {
    pathPrefix: (slug) => `${slug}/branding`,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    public: true,
  },
  [S3Category.USER_AVATAR]: {
    pathPrefix: (slug) => `${slug}/avatars`,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSizeBytes: 1 * 1024 * 1024, // 1 MB
    public: true,
  },
  [S3Category.CONTACT_DOCUMENT]: {
    pathPrefix: (slug) => `${slug}/documents/contacts`,
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    public: false,
  },
  [S3Category.DEAL_ATTACHMENT]: {
    pathPrefix: (slug) => `${slug}/documents/deals`,
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'],
    maxSizeBytes: 20 * 1024 * 1024, // 20 MB
    public: false,
  },
}
