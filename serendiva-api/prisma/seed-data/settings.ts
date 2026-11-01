/**
 * Site settings (one SiteSetting row per key). Same shapes as `SettingValueSchemas` in
 * src/modules/settings/settings.schemas.ts, except that media references are image keys from images.ts
 * (resolved to Media ids by the seed) and translatable texts are plain English strings.
 *
 * PLACEHOLDER SAMPLE CONTENT from the client's Stitch design — phone numbers, e-mail, social links,
 * licence numbers and counters must be confirmed by the client. Social profile URLs and the intro video URL
 * are placeholders.
 */
import type { ImageKey } from './images'

export const contact = {
  phone: '+94 11 234 5678',
  whatsapp: '94771234567',
  whatsappDisplay: '+94 77 123 4567',
  email: 'private@serendiva.lk',
  address: 'Colombo 07, Sri Lanka',
  serviceArea: 'Islandwide private journeys · based in Colombo & Kandy',
  hours: '07:00 – 21:00 (Sri Lanka Time / UTC+5:30)',
  responseTime: 'I reply personally within 24 hours — usually within a few hours on WhatsApp',
  mapLat: 6.9067,
  mapLng: 79.8653,
}

export const social = {
  instagram: 'https://www.instagram.com/serendiva.ceylon',
  instagramHandle: '@serendiva.ceylon',
  tripadvisor: 'https://www.tripadvisor.com/',
  google: 'https://g.page/serendiva-ceylon',
}

export const guide: {
  name: string
  title: string
  licenseNumber: string
  operatorLicense: string
  yearsGuiding: number
  languages: string[]
  portrait: ImageKey
  candid: ImageKey
  candidCaption: string
  introVideoUrl: string
} = {
  name: 'Dinesh Jayasuriya',
  title: 'Accredited National Tourist Guide Lecturer',
  licenseNumber: 'SLTDA/SQA/NTGL/01482',
  operatorLicense: 'TS/2024/091',
  yearsGuiding: 14,
  languages: ['English', 'German', '中文', 'Sinhala'],
  portrait: 'guide-portrait-temple',
  candid: 'guide-candid-tea-terraces',
  candidCaption: 'In the field · Nuwara Eliya',
  introVideoUrl: 'https://www.youtube.com/watch?v=PLACEHOLD00',
}

export const counters: { value: string; label: string }[] = [
  { value: '14+', label: 'Years Guiding Ceylon' },
  { value: '2,400+', label: 'Happy Travelers Hosted' },
  { value: '680+', label: 'Private Tours Completed' },
  { value: '4', label: 'Languages (EN, DE, 中文, SI)' },
]

export const trustBadges: {
  icon: string
  title: string
  subtitle: string
  tone: 'green' | 'cinnamon' | 'gold'
}[] = [
  { icon: 'verified_user', title: 'National Tour Guide', subtitle: 'SLTDA/SQA/NTGL/01482', tone: 'green' },
  { icon: 'star', title: "5.0★ Travelers' Choice", subtitle: '310+ Verified Reviews', tone: 'cinnamon' },
]

export const heroSlides: { image: ImageKey; alt: string }[] = [
  {
    image: 'hero-sigiriya-sunrise',
    alt: 'Sigiriya Rock Fortress emerging from morning mist at golden sunrise',
  },
  { image: 'hero-ella-nine-arch-train', alt: 'Blue train crossing the Nine Arch Bridge in Ella' },
  { image: 'hero-mirissa-palm-beach', alt: 'Palm-lined golden beach at Mirissa at dusk' },
]

export const seo: { siteName: string; defaultTitle: string; defaultDescription: string; ogImage: ImageKey } =
  {
    siteName: 'Serendiva',
    defaultTitle: 'Serendiva · Private Sri Lanka Tours with a Licensed Guide',
    defaultDescription:
      'Private, bespoke Sri Lanka journeys personally guided by Dinesh Jayasuriya, an SLTDA-licensed National Tourist Guide Lecturer. No fixed dates, no shared strangers.',
    ogImage: 'hero-sigiriya-sunrise',
  }

/** The corporate page "Confidential Clients & Diplomatic Envoys" strip (no logos in the design). */
export const corporateClients: string[] = [
  'Diplomatic Mission Colombo',
  'Zürich Wealth Management',
  'Nordic Tech Consortium',
  'Global Conservation Trust',
]

/** The six squares of the home page Instagram strip */
export const instagramFeed: ImageKey[] = [
  'insta-cinnamon-quills',
  'insta-minneriya-elephant',
  'insta-weligama-stilt-fishermen',
  'insta-train-window-tea',
  'insta-ambalangoda-mask',
  'insta-anuradhapura-monk',
]
