/**
 * Shapes of the seed data files. They mirror the admin write schemas (`TourWrite`, `DestinationWrite`, ...)
 * but use plain English strings (the seed wraps them as `{ en }`), image keys from `images.ts` instead
 * of Media ids, and slugs instead of database ids. `prisma/seed.ts` resolves and validates everything
 * with the real write schemas before inserting.
 */
import type { z } from 'zod'
import type {
  FeatureItem,
  IconTextItem,
  LabelValueItem,
  MapStop,
  OverviewBlock,
  TerrainItem,
} from '@/lib/content-schemas'
import type {
  CuisineBlock,
  ExperienceItem,
  GuideNoteBlock,
  QuickFactItem,
  StayItem,
} from '@/modules/destinations/destinations.schemas'
import type { SEASONS } from '@/modules/tours/tours.schemas'
import type { ImageKey } from './images'

export type Feature = z.infer<typeof FeatureItem>
export type IconText = z.infer<typeof IconTextItem>
export type LabelValue = z.infer<typeof LabelValueItem>
export type Terrain = z.infer<typeof TerrainItem>
export type Overview = z.infer<typeof OverviewBlock>
export type Stop = z.infer<typeof MapStop>
export type QuickFact = z.infer<typeof QuickFactItem>
export type GuideNote = z.infer<typeof GuideNoteBlock>
export type Cuisine = z.infer<typeof CuisineBlock>

export type TravellerType = 'couple' | 'family' | 'group' | 'solo' | 'corporate'
export type Season = (typeof SEASONS)[number]

/** A captioned image (tour / destination galleries). */
export interface SeedCaptionedImage {
  image: ImageKey
  title?: string
  caption?: string
}

export interface SeedCategory {
  slug: string
  name: string
  shortName: string
  kicker: string
  description: string
  icon: string
  image: ImageKey
}

export interface SeedRegion {
  slug: string
  name: string
  description: string
  places: string
  icon: string
  /** Jan..Dec */
  bestMonths: ('peak' | 'good' | 'rain')[]
  image: ImageKey
}

export type SeedExperience = Omit<z.infer<typeof ExperienceItem>, 'imageId'> & { image?: ImageKey }
export type SeedStay = Omit<z.infer<typeof StayItem>, 'imageId'> & { image?: ImageKey }

export interface SeedDestination {
  slug: string
  region: string
  name: string
  headline: string
  tagline: string
  summary: string
  /** Markdown */
  description: string
  metaLabel: string
  badge?: string
  bestTimeLabel: string
  curations: string[]
  quickFacts: QuickFact[]
  guideNote?: GuideNote
  experiences: SeedExperience[]
  cuisine?: Cuisine
  stays?: SeedStay[]
  fieldNotes: Feature[]
  interests: string[]
  mapPoints: Stop[]
  latitude: number
  longitude: number
  elevation: number
  cover: ImageKey
  gallery: SeedCaptionedImage[]
  seoTitle?: string
  seoDescription?: string
}

export interface SeedTourDay {
  title: string
  /** Markdown paragraphs */
  description: string
  drivingTime?: string
  meals?: string
  overnightArea?: string
  details?: LabelValue[]
  isHighlight?: boolean
  stops: Stop[]
}

export interface SeedTour {
  slug: string
  isFeatured?: boolean
  isMostPopular?: boolean
  title: string
  summary: string
  /** Markdown */
  description: string
  cardTag?: string
  durationDays: number
  durationNights: number
  route: string[]
  highlights: string[]
  badges?: string[]
  overview?: Overview
  keyFeatures: Feature[]
  included: IconText[]
  notIncluded: IconText[]
  terrains?: Terrain[]
  routeSummary?: string
  travellerTypes: TravellerType[]
  seasons: Season[]
  cover: ImageKey
  gallery: SeedCaptionedImage[]
  /** Day numbers are the array positions (day 1 first). */
  days: SeedTourDay[]
  /** Category slugs — the card shows the category with the lowest `order` first */
  categories: string[]
  /** Destination slugs, in route order */
  destinations: string[]
  seoTitle?: string
  seoDescription?: string
}

export interface SeedReview {
  guestName: string
  /** ISO 3166-1 alpha-2 */
  country: string
  location?: string
  partyLabel?: string
  travellerType: TravellerType
  tourType?: string
  tripLabel?: string
  /** Tour slug */
  tour?: string
  rating: number
  title?: string
  text: string
  photo?: ImageKey
  tripPhotos?: ImageKey[]
  source: 'direct' | 'tripadvisor' | 'google'
  /** YYYY-MM */
  travelDate: string
  status: 'pending' | 'approved'
  isFeatured?: boolean
  /** Only for guest submissions (never public) */
  email?: string
}

export interface SeedFaq {
  question: string
  /** Markdown allowed */
  answer: string
}

export interface SeedBlogPost {
  slug: string
  title: string
  excerpt: string
  category: { slug: string; label: string }
  tags: string[]
  cover: ImageKey
  authorName?: string
  isFeatured?: boolean
  /** publishedAt = now − this many days (keeps the journal looking current) */
  publishedDaysAgo: number
  /** Markdown */
  content: string
  seoTitle?: string
  seoDescription?: string
}

export interface SeedGalleryItem {
  type: 'image' | 'video'
  image: ImageKey
  videoUrl?: string
  category: string
  title?: string
  caption?: string
  location?: string
}

export interface SeedAvailability {
  /** Offset from today in days (inclusive start) */
  startInDays: number
  /** Length of the range in days (inclusive) */
  days: number
  type: 'busy' | 'available'
  note?: string
}
