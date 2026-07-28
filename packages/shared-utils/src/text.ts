const DIACRITICS_REGEX = /[\u0300-\u036f]/g

export function normalizeText(value: string): string {
  return value.toLowerCase().trim().normalize('NFD').replaceAll(DIACRITICS_REGEX, '')
}

export function slugify(value: string): string {
  return normalizeText(value)
    .replaceAll(/\s+/g, '-')
    .replaceAll(/[^a-z0-9-]/g, '')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-|-$/g, '')
}
