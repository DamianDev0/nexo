interface CountHintProps {
  readonly count: number
  readonly label: string
}

export function CountHint({ count, label }: Readonly<CountHintProps>) {
  return (
    <span
      aria-label={label}
      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium tabular-nums text-muted-foreground"
    >
      {count}
    </span>
  )
}
