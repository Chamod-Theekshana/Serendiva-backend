import argon2 from 'argon2'
import type { PrismaClient } from '@/generated/prisma/client'
import { jsonValue } from '@/lib/json'
import type { TourInputT } from '@/modules/tours/tours.schemas'
import { ADMIN } from './helpers'

/**
 * Small Prisma factories with sensible defaults. They write directly to the database (fast, and
 * independent of the admin endpoints under test); every field can be overridden.
 */

let seq = 0
const next = () => ++seq
const uniq = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${next()}`

const hashes = new Map<string, Promise<string>>()
/** argon2 is deliberately slow; hash each test password once per worker. */
const hashOnce = (password: string) => {
  let h = hashes.get(password)
  if (!h) {
    h = argon2.hash(password)
    hashes.set(password, h)
  }
  return h
}

export async function createAdmin(
  prisma: PrismaClient,
  over: { email?: string; password?: string; name?: string } = {},
) {
  const email = (over.email ?? ADMIN.email).toLowerCase()
  const password = over.password ?? ADMIN.password
  const user = await prisma.adminUser.create({
    data: { email, name: over.name ?? ADMIN.name, passwordHash: await hashOnce(password) },
  })
  return { user, email, password }
}

export function createMedia(
  prisma: PrismaClient,
  over: Partial<{ key: string; url: string; mime: string; size: number; width: number | null; height: number | null; alt: string }> = {},
) {
  const key = over.key ?? `media/test/${uniq('image')}.webp`
  return prisma.media.create({
    data: {
      key,
      url: over.url ?? `http://api.serendiva.test/uploads/${key}`,
      mime: over.mime ?? 'image/webp',
      size: over.size ?? 1234,
      width: over.width === undefined ? 1600 : over.width,
      height: over.height === undefined ? 1067 : over.height,
      altText: jsonValue({ en: over.alt ?? 'Test image' }),
      originalName: 'test.jpg',
    },
  })
}

export function createCategory(
  prisma: PrismaClient,
  over: Partial<{ slug: string; name: Record<string, string>; order: number; icon: string }> = {},
) {
  const slug = over.slug ?? uniq('category')
  return prisma.category.create({
    data: {
      slug,
      name: jsonValue(over.name ?? { en: `Category ${slug}` }),
      icon: over.icon ?? 'temple_buddhist',
      order: over.order ?? 0,
    },
  })
}

export interface TourFactoryInput {
  slug: string
  status: 'draft' | 'published'
  order: number
  title: Record<string, string>
  summary: Record<string, string>
  highlights: Record<string, string[]>
  durationDays: number
  durationNights: number
  route: string[]
  isFeatured: boolean
  categoryIds: string[]
  destinationIds: string[]
  coverId: string | null
  travellerTypes: ('couple' | 'family' | 'group' | 'solo' | 'corporate')[]
  publishedAt: Date | null
  days: { dayNumber: number; title: Record<string, string>; description: Record<string, string> }[]
}

export function createTour(prisma: PrismaClient, over: Partial<TourFactoryInput> = {}) {
  const slug = over.slug ?? uniq('tour')
  const status = over.status ?? 'published'
  const days = over.days ?? [
    { dayNumber: 1, title: { en: 'Arrival in Colombo' }, description: { en: 'Airport welcome and transfer.' } },
    { dayNumber: 2, title: { en: 'Sigiriya' }, description: { en: 'Climb the Lion Rock at dawn.' } },
  ]
  return prisma.tour.create({
    data: {
      slug,
      status,
      order: over.order ?? 0,
      isFeatured: over.isFeatured ?? false,
      publishedAt: over.publishedAt !== undefined ? over.publishedAt : status === 'published' ? new Date() : null,
      title: jsonValue(over.title ?? { en: `Tour ${slug}` }),
      summary: jsonValue(over.summary ?? { en: 'A private journey through Sri Lanka.' }),
      description: jsonValue({ en: 'Long description in **markdown**.' }),
      durationDays: over.durationDays ?? 7,
      durationNights: over.durationNights ?? (over.durationDays ?? 7) - 1,
      route: over.route ?? ['Colombo', 'Sigiriya', 'Kandy'],
      highlights: jsonValue(over.highlights ?? { en: ['Private licensed guide', 'Hand-picked stays'] }),
      included: jsonValue({ en: [{ icon: 'directions_car', text: 'Private air-conditioned vehicle' }] }),
      notIncluded: jsonValue({ en: [{ icon: 'flight', text: 'International flights' }] }),
      travellerTypes: over.travellerTypes ?? ['couple'],
      seasons: ['year-round'],
      coverId: over.coverId ?? null,
      days: {
        create: days.map((d) => ({ dayNumber: d.dayNumber, title: jsonValue(d.title), description: jsonValue(d.description) })),
      },
      categories: { create: (over.categoryIds ?? []).map((categoryId) => ({ categoryId })) },
      destinations: { create: (over.destinationIds ?? []).map((destinationId, order) => ({ destinationId, order })) },
    },
  })
}

export function createRegion(prisma: PrismaClient, over: Partial<{ slug: string; name: Record<string, string>; order: number }> = {}) {
  const slug = over.slug ?? uniq('region')
  return prisma.region.create({
    data: {
      slug,
      name: jsonValue(over.name ?? { en: `Region ${slug}` }),
      bestMonths: ['peak', 'peak', 'peak', 'good', 'rain', 'rain', 'good', 'good', 'rain', 'rain', 'good', 'peak'],
      order: over.order ?? 0,
    },
  })
}

export function createDestination(
  prisma: PrismaClient,
  over: Partial<{
    slug: string
    status: 'draft' | 'published'
    name: Record<string, string>
    summary: Record<string, string>
    regionId: string | null
    order: number
  }> = {},
) {
  const slug = over.slug ?? uniq('destination')
  return prisma.destination.create({
    data: {
      slug,
      status: over.status ?? 'published',
      order: over.order ?? 0,
      name: jsonValue(over.name ?? { en: `Destination ${slug}` }),
      summary: jsonValue(over.summary ?? { en: 'A place worth the detour.' }),
      regionId: over.regionId ?? null,
      latitude: 7.957,
      longitude: 80.76,
    },
  })
}

export function createReview(
  prisma: PrismaClient,
  over: Partial<{
    guestName: string
    country: string
    travellerType: 'couple' | 'family' | 'group' | 'solo' | 'corporate'
    rating: number
    text: string
    status: 'pending' | 'approved' | 'rejected'
    tourId: string | null
    email: string | null
    isFeatured: boolean
    travelDate: Date | null
  }> = {},
) {
  const status = over.status ?? 'approved'
  return prisma.review.create({
    data: {
      guestName: over.guestName ?? `Guest ${next()}`,
      country: over.country ?? 'GB',
      travellerType: over.travellerType ?? 'couple',
      rating: over.rating ?? 5,
      text: over.text ?? 'Wonderful trip, perfectly organised from start to finish.',
      status,
      approvedAt: status === 'approved' ? new Date() : null,
      tourId: over.tourId ?? null,
      email: over.email === undefined ? 'guest@example.com' : over.email,
      isFeatured: over.isFeatured ?? false,
      travelDate: over.travelDate ?? new Date('2026-02-01T00:00:00.000Z'),
      source: 'direct',
    },
  })
}

/** A valid admin TourWrite body (POST/PUT /api/v1/admin/tours). */
export function tourWrite(over: Partial<TourInputT> = {}): Record<string, unknown> {
  return {
    slug: over.slug ?? uniq('tour'),
    status: 'draft',
    title: { en: 'Cultural Triangle in Depth' },
    summary: { en: 'Five days among the ancient kingdoms.' },
    description: { en: 'A longer overview of the journey.' },
    durationDays: 5,
    durationNights: 4,
    route: ['Colombo', 'Anuradhapura', 'Sigiriya', 'Kandy'],
    highlights: { en: ['Sigiriya', 'Dambulla cave temples'] },
    included: { en: [{ icon: 'directions_car', text: 'Private vehicle' }] },
    notIncluded: { en: [{ icon: 'flight', text: 'Flights' }] },
    days: [
      { dayNumber: 1, title: { en: 'Arrival' }, description: { en: 'Welcome to Sri Lanka.' } },
      { dayNumber: 2, title: { en: 'Anuradhapura' }, description: { en: 'Sacred city by bicycle.' } },
    ],
    ...over,
  }
}
