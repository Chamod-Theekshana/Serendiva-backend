/**
 * Tour categories — the nine "Choose Your Island Horizon" tiles of the home page.
 * `shortName` is the filter-chip label used on the tours page.
 *
 * PLACEHOLDER SAMPLE CONTENT taken from the client's Stitch design — to be reviewed/replaced by the client.
 * The array order is the display order (Category.order).
 */
import type { SeedCategory } from './types'

export const categories: SeedCategory[] = [
  {
    slug: 'cultural-heritage',
    name: 'Cultural & Ancient Kingdoms',
    shortName: 'Cultural & Heritage',
    kicker: 'Heritage & Monasteries',
    description: 'Sigiriya, Polonnaruwa, Dambulla cave sanctuaries, and sacred Anuradhapura stupas.',
    icon: 'temple_buddhist',
    image: 'cat-cultural-polonnaruwa',
  },
  {
    slug: 'wildlife-safari',
    name: 'Wildlife & Safari Expeditions',
    shortName: 'Wildlife & Safari',
    kicker: 'Apex Wildlife',
    description: 'Yala leopards, Minneriya grand elephant gatherings, and Wilpattu sloth bears.',
    icon: 'pets',
    image: 'cat-wildlife-leopard',
  },
  {
    slug: 'pristine-beaches',
    name: 'Pristine Southern Beaches',
    shortName: 'Pristine Beach',
    kicker: 'Coastal Sanctuaries',
    description: 'Mirissa, Tangalle private coves, Galle Fort ramparts, and Pasikuda sands.',
    icon: 'beach_access',
    image: 'cat-beach-tangalle',
  },
  {
    slug: 'hill-country',
    name: 'Central Hill Country & Tea Trails',
    shortName: 'Hill Country',
    kicker: 'Highland Mist',
    description: 'Ella gorges, Nuwara Eliya colonial estates, and Hatton private planter bungalows.',
    icon: 'landscape',
    image: 'cat-hill-country-tea',
  },
  {
    slug: 'trekking-adventure',
    name: 'Highland Trekking & Peaks',
    shortName: 'Trekking & Adventure',
    kicker: 'Active Wilderness',
    description: "Knuckles Mountain Range cloud forests, Adam's Peak sacred pilgrim ascent, and waterfalls.",
    icon: 'hiking',
    image: 'cat-trekking-knuckles',
  },
  {
    slug: 'honeymoon',
    name: 'Bespoke Honeymoons',
    shortName: 'Bespoke Honeymoon',
    kicker: 'Intimate Retreats',
    description: 'Secluded private cliffside pavilions, candlelit tea garden dinners, and couples wellness.',
    icon: 'favorite',
    image: 'cat-honeymoon-villa-pool',
  },
  {
    slug: 'family',
    name: 'Family Journeys & Wildlife',
    shortName: 'Family Expeditions',
    kicker: 'Multi-Generational',
    description:
      'Spacious climate-controlled travel, gentle walks, interactive village pottery, and beach leisure.',
    icon: 'family_restroom',
    image: 'cat-family-udawalawe',
  },
  {
    slug: 'ayurveda-wellness',
    name: 'Ayurveda & Forest Wellness',
    shortName: 'Ayurveda & Wellness',
    kicker: 'Holistic Rejuvenation',
    description:
      'Pancha Karma treatments, certified Ayurvedic physicians, herbal gardens, and forest meditation.',
    icon: 'spa',
    image: 'cat-ayurveda-pavilion',
  },
  {
    slug: 'ramayana-trail',
    name: 'Sacred Ramayana Heritage',
    shortName: 'Ramayana Trail',
    kicker: 'Spiritual Mythology',
    description:
      'Munneswaram, Ravana Ella waterfalls, Seetha Amman kovil, and Ashok Vatika botanical gardens.',
    icon: 'auto_stories',
    image: 'cat-ramayana-seetha-amman',
  },
]
