import type { AppDeps } from '@/types'
import { tr, type Locale } from '@/lib/i18n'
import { toImage, type MediaLike } from '@/lib/media-dto'
import { badRequest, validationError } from '@/lib/errors'
import { Tags } from '@/lib/revalidate'
import { asObj, num, objList, str, strList, strOrNull, type JsonObj } from '@/modules/shared/json-read'
import { createSettingsRepository } from './settings.repository'
import {
  SETTING_KEYS,
  SettingValueSchemas,
  type AdminSettings,
  type PublicSettings,
  type SettingKey,
  type SettingValues,
} from './settings.schemas'

/** Geographic centre of Sri Lanka — map default until the contact setting is filled in. */
const DEFAULT_MAP = { lat: 7.8731, lng: 80.7718 }
const TONES = ['green', 'cinnamon', 'gold'] as const

const isSettingKey = (k: string): k is SettingKey => (SETTING_KEYS as readonly string[]).includes(k)

/** Every media id referenced by the (raw) settings, each with its path inside its setting value. */
function mediaRefsIn(raw: Partial<Record<SettingKey, unknown>>): { key: SettingKey; path: string; id: string }[] {
  const out: { key: SettingKey; path: string; id: string }[] = []
  const add = (key: SettingKey, path: string, id: unknown) => {
    if (typeof id === 'string' && id) out.push({ key, path, id })
  }
  const guide = asObj(raw.guide)
  add('guide', 'portraitId', guide?.portraitId)
  add('guide', 'candidId', guide?.candidId)
  objList(raw.heroSlides).forEach((s, i) => add('heroSlides', `${i}.imageId`, s.imageId))
  add('seo', 'ogImageId', asObj(raw.seo)?.ogImageId)
  objList(raw.corporateClients).forEach((c, i) => add('corporateClients', `${i}.logoId`, c.logoId))
  strList(raw.instagramFeed).forEach((id, i) => add('instagramFeed', `${i}`, id))
  objList(raw.pageImages).forEach((p, i) => add('pageImages', `${i}.imageId`, p.imageId))
  return out
}

export function createSettingsService(deps: AppDeps) {
  const repo = createSettingsRepository(deps.prisma)

  async function loadRaw(): Promise<Partial<Record<SettingKey, unknown>>> {
    const rows = await repo.all()
    const raw: Partial<Record<SettingKey, unknown>> = {}
    for (const r of rows) if (isSettingKey(r.key)) raw[r.key] = r.value
    return raw
  }

  async function adminSettings(): Promise<AdminSettings> {
    const raw = await loadRaw()
    const values = {} as { [K in SettingKey]: SettingValues[K] | null }
    for (const key of SETTING_KEYS) {
      // A stored value that no longer matches the contract is shown as "not set" so it can be re-saved.
      const parsed = raw[key] === undefined ? null : SettingValueSchemas[key].safeParse(raw[key])
      ;(values as Record<SettingKey, unknown>)[key] = parsed?.success ? parsed.data : null
    }
    const mediaRefs = await repo.adminMediaRefs(mediaRefsIn(values).map((r) => r.id))
    return { ...values, mediaRefs }
  }

  return {
    /**
     * Localized settings for the website. Read defensively field by field so a missing or partial
     * setting falls back to empty defaults instead of failing.
     */
    async publicSettings(locale: Locale): Promise<PublicSettings> {
      const [raw, stats] = await Promise.all([loadRaw(), repo.reviewStats()])
      const media: Map<string, MediaLike> = await repo.mediaMap(mediaRefsIn(raw).map((r) => r.id))
      const t = (v: unknown): string => (typeof v === 'string' ? v : str(tr<unknown>(v, locale, '')))
      const tOrNull = (v: unknown): string | null => strOrNull(t(v))
      const img = (id: unknown, alt = '') => (typeof id === 'string' && id ? toImage(media.get(id), locale, alt) : null)

      const contact: JsonObj = asObj(raw.contact) ?? {}
      const social: JsonObj = asObj(raw.social) ?? {}
      const guide: JsonObj = asObj(raw.guide) ?? {}
      const seo: JsonObj = asObj(raw.seo) ?? {}
      const siteName = str(seo.siteName) || 'Serendiva'
      const guideName = str(guide.name)

      return {
        contact: {
          phone: str(contact.phone),
          whatsapp: str(contact.whatsapp),
          whatsappDisplay: str(contact.whatsappDisplay),
          email: str(contact.email),
          address: t(contact.address),
          serviceArea: t(contact.serviceArea),
          hours: t(contact.hours),
          responseTime: t(contact.responseTime),
          mapLat: num(contact.mapLat) ?? DEFAULT_MAP.lat,
          mapLng: num(contact.mapLng) ?? DEFAULT_MAP.lng,
        },
        social: {
          instagram: strOrNull(social.instagram),
          instagramHandle: strOrNull(social.instagramHandle),
          facebook: strOrNull(social.facebook),
          tripadvisor: strOrNull(social.tripadvisor),
          google: strOrNull(social.google),
          youtube: strOrNull(social.youtube),
        },
        guide: {
          name: guideName,
          title: t(guide.title),
          licenseNumber: str(guide.licenseNumber),
          operatorLicense: str(guide.operatorLicense),
          yearsGuiding: Math.max(0, Math.round(num(guide.yearsGuiding) ?? 0)),
          languages: strList(guide.languages),
          portrait: img(guide.portraitId, guideName),
          candid: img(guide.candidId, guideName),
          candidCaption: tOrNull(guide.candidCaption),
          introVideoUrl: strOrNull(guide.introVideoUrl),
        },
        counters: objList(raw.counters).map((c) => ({ value: str(c.value), label: t(c.label) })),
        trustBadges: objList(raw.trustBadges).map((b) => ({
          icon: str(b.icon),
          title: t(b.title),
          subtitle: t(b.subtitle),
          tone: (TONES as readonly unknown[]).includes(b.tone) ? (b.tone as (typeof TONES)[number]) : 'green',
        })),
        heroSlides: objList(raw.heroSlides).flatMap((s) => {
          const image = img(s.imageId, siteName)
          if (!image) return []
          const alt = tOrNull(s.alt)
          return [alt ? { ...image, alt } : image]
        }),
        seo: {
          siteName,
          defaultTitle: t(seo.defaultTitle) || siteName,
          defaultDescription: t(seo.defaultDescription),
          ogImage: img(seo.ogImageId, siteName),
        },
        corporateClients: objList(raw.corporateClients).map((c) => ({ name: str(c.name), logo: img(c.logoId, str(c.name)) })),
        instagramFeed: strList(raw.instagramFeed).flatMap((id) => img(id, siteName) ?? []),
        pageImages: Object.fromEntries(
          objList(raw.pageImages).flatMap((p) => {
            const image = img(p.imageId, siteName)
            return image && str(p.slot) ? [[str(p.slot), image] as const] : []
          }),
        ),
        reviewSummary: {
          average: Math.round((stats._avg.rating ?? 0) * 100) / 100,
          count: stats._count,
        },
      }
    },

    adminGet: adminSettings,

    /** Validate and store one setting, then return all settings for the editor. */
    async update(key: string, value: unknown): Promise<AdminSettings> {
      if (!isSettingKey(key)) throw badRequest(`Unknown setting key "${key}"`, { allowed: SETTING_KEYS })
      const parsed = SettingValueSchemas[key].safeParse(value)
      if (!parsed.success) {
        throw validationError(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
      }
      await repo.assertMedia(mediaRefsIn({ [key]: parsed.data }).map((r) => ({ path: r.path, id: r.id })))
      await repo.upsert(key, parsed.data)
      deps.revalidator.revalidate([Tags.settings])
      return adminSettings()
    },
  }
}
