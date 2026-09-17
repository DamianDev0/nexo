export function collectTags(
  rows: ReadonlyArray<{ readonly tags?: ReadonlyArray<string> }>,
): string[] {
  const names = new Set<string>()
  for (const row of rows) for (const tag of row.tags ?? []) names.add(tag)
  return [...names]
}
