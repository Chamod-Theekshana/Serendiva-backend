/**
 * Regions — the six "biogeographic terraces" of the destinations page.
 *
 * `bestMonths` (Jan..Dec) comes from the design's "Dual-Monsoon Seasonal Matrix":
 * ☀️ → peak, 🌤️ / ⛅ → good, 🌧️ → rain. The matrix has five rows; "Colombo & Maritime West" uses the
 * "South & West Coast" row. The wildlife row only shows paw icons (🐾) for open months, so it was refined
 * with the Yala card's "Feb – Jun (Peak Sightings)": Feb–Jun peak, other 🐾 months good.
 *
 * PLACEHOLDER SAMPLE CONTENT taken from the client's Stitch design — to be reviewed/replaced by the client.
 * The array order is the display order (Region.order).
 */
import type { SeedRegion } from './types'

export const regions: SeedRegion[] = [
  {
    slug: 'cultural-triangle',
    name: 'Cultural Triangle',
    description: 'Sacred Monasteries, Sigiriya Sky Citadel & Gilded Dambulla Caves',
    places: 'Sigiriya, Dambulla, Anuradhapura, Polonnaruwa',
    icon: 'temple_buddhist',
    // ☀️ ☀️ ☀️ ☀️ 🌤️ 🌤️ 🌤️ 🌤️ 🌤️ 🌧️ 🌧️ ☀️
    bestMonths: [
      'peak',
      'peak',
      'peak',
      'peak',
      'good',
      'good',
      'good',
      'good',
      'good',
      'rain',
      'rain',
      'peak',
    ],
    image: 'dest-sigiriya-aerial-moat',
  },
  {
    slug: 'hill-country',
    name: 'Central Hill Country',
    description: 'Ella Tea Terraces, Nuwara Eliya Peaks & Knuckles Cloud Ridge',
    places: 'Ella, Nuwara Eliya, Hatton, Knuckles, Kandy',
    icon: 'landscape',
    // 🌤️ ☀️ ☀️ ☀️ ⛅ 🌧️ ☀️ ☀️ ⛅ 🌧️ 🌧️ 🌤️
    bestMonths: [
      'good',
      'peak',
      'peak',
      'peak',
      'good',
      'rain',
      'peak',
      'peak',
      'good',
      'rain',
      'rain',
      'good',
    ],
    image: 'dest-ella-gap-viewpoint',
  },
  {
    slug: 'south-coast',
    name: 'Southern Golden Coast',
    description: 'Galle Fort Ramparts, Stilt Fishermen, Mirissa Azure Coves',
    places: 'Galle Fort, Mirissa, Weligama, Tangalle',
    icon: 'fort',
    // ☀️ ☀️ ☀️ ☀️ 🌧️ 🌧️ ⛅ ⛅ 🌧️ 🌧️ ☀️ ☀️
    bestMonths: [
      'peak',
      'peak',
      'peak',
      'peak',
      'rain',
      'rain',
      'good',
      'good',
      'rain',
      'rain',
      'peak',
      'peak',
    ],
    image: 'dest-galle-lighthouse',
  },
  {
    slug: 'east-coast',
    name: 'Wild East & Marine Corridors',
    description: 'Trincomalee Deep Harbor, Pigeon Island Reefs & Pasikudah',
    places: 'Trincomalee, Pasikudah, Arugam Bay, Jaffna',
    icon: 'phishing',
    // 🌧️ ⛅ 🌤️ ☀️ ☀️ ☀️ ☀️ ☀️ ☀️ ⛅ 🌧️ 🌧️
    bestMonths: [
      'rain',
      'good',
      'good',
      'peak',
      'peak',
      'peak',
      'peak',
      'peak',
      'peak',
      'good',
      'rain',
      'rain',
    ],
    image: 'dest-trincomalee-koneswaram',
  },
  {
    slug: 'wilderness-parks',
    name: 'Deep Wilderness & Safaris',
    description: 'Yala Leopard Dens, Bundala Lagoons & Wilpattu Villus',
    places: 'Yala, Wilpattu, Udawalawe, Minneriya',
    icon: 'pets',
    // 🐾 ×9, 🌧️ 🌧️, 🐾 — refined with the Yala "Feb – Jun peak sightings" window
    bestMonths: [
      'good',
      'peak',
      'peak',
      'peak',
      'peak',
      'peak',
      'good',
      'good',
      'good',
      'rain',
      'rain',
      'good',
    ],
    image: 'dest-yala-leopard-trail',
  },
  {
    slug: 'colombo-west',
    name: 'Colombo & Maritime West',
    description: 'Colonial Cinnamon Mansions, Geoffrey Bawa Architecture & Coastal Sunsets',
    places: 'Colombo, Negombo, Bentota',
    icon: 'apartment',
    // Same row as the South & West Coast
    bestMonths: [
      'peak',
      'peak',
      'peak',
      'peak',
      'rain',
      'rain',
      'good',
      'good',
      'rain',
      'rain',
      'peak',
      'peak',
    ],
    image: 'blog-bawa-lunuganga',
  },
]
