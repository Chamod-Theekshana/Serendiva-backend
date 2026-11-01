/** "Tea Mist, Monasteries & Colonial Charms" -> "tea-mist-monasteries-colonial-charms" */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
