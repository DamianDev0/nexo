export function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
}
