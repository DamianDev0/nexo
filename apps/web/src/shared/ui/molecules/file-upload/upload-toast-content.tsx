import { UPLOAD_ACCENT_ACTIVE, UPLOAD_ACCENT_SUCCESS } from '@/shared/config/tokens/effects'

interface UploadToastContentProps {
  readonly fileName: string
  readonly fileSize: string
  readonly status: 'loading' | 'success'
}

export function UploadToastContent({
  fileName,
  fileSize,
  status,
}: Readonly<UploadToastContentProps>) {
  const isSuccess = status === 'success'
  const accentColor = isSuccess ? UPLOAD_ACCENT_SUCCESS : UPLOAD_ACCENT_ACTIVE

  return (
    <div className="-mt-1.5 flex flex-col gap-4">
      <div className="-mb-4 flex items-center justify-between">
        <div className="text-[13px] font-medium leading-none tracking-tight opacity-50">
          {fileSize}
        </div>
      </div>

      <div className="relative flex items-center justify-between overflow-visible">
        <svg className="mt-4 size-6 shrink-0" viewBox="0 0 24 24" fill="none">
          <title>File</title>
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"
            fill={`${accentColor}20`}
            stroke={accentColor}
            strokeWidth="1.5"
          />
          <path d="M14 2v6h6" stroke={accentColor} strokeWidth="1.5" />
        </svg>

        <div className="relative mx-1 flex max-h-2.5 flex-1 items-center overflow-visible">
          <svg
            viewBox="0 0 300 120"
            fill="none"
            preserveAspectRatio="none"
            className="absolute inset-x-0 -mb-5 bottom-0 h-20 w-full overflow-visible"
          >
            <title>Upload path</title>
            <path
              d="M 4 118 Q 150 -20 296 118"
              stroke={accentColor}
              strokeWidth="2"
              strokeDasharray="6 4"
              strokeOpacity="0.5"
              fill="none"
              vectorEffect="non-scaling-stroke"
              shapeRendering="geometricPrecision"
            />
          </svg>
          <div
            className="absolute left-3 -bottom-4 z-10 flex size-5 items-center justify-center rounded-full"
            style={{ background: `${accentColor}30` }}
          >
            <svg className="size-3" viewBox="0 0 24 24" fill="none" style={{ color: accentColor }}>
              <title>Arrow</title>
              <path
                d="m7 17 9.2-9.2M17 17V7H7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            className="absolute right-3 -bottom-4 z-10 flex size-5 items-center justify-center rounded-full"
            style={{ background: `${accentColor}30` }}
          >
            <svg
              className="size-3 rotate-90"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: accentColor }}
            >
              <title>Arrow</title>
              <path
                d="m7 17 9.2-9.2M17 17V7H7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <svg className="mt-4 size-6 shrink-0" viewBox="0 0 24 24" fill="none">
          <title>Cloud</title>
          <path
            d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"
            fill={`${accentColor}20`}
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {!isSuccess && (
            <path
              d="M12 13v5M9 16l3-3 3 3"
              stroke={accentColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          )}
          {isSuccess && (
            <path
              d="m9 15 2.5 2.5L15 13"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>

      <div className="truncate text-center text-xs font-medium tracking-tight opacity-60">
        {fileName}
      </div>
    </div>
  )
}
