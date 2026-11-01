/**
 * Pristine Southern Beaches & Whale Trails — card copy from the design; itinerary written for the seed.
 *
 * PLACEHOLDER SAMPLE CONTENT — to be reviewed/replaced by the client.
 */
import type { SeedTour } from '../types'
import {
  P,
  accommodation,
  guideIncluded,
  refreshmentsIncluded,
  standardNotIncluded,
  vehicleIncluded,
} from './common'

const mulkirigala = { name: 'Mulkirigala Rock Temple', lat: 6.123, lng: 80.736 }
const rekawa = { name: 'Rekawa Turtle Beach', lat: 6.049, lng: 80.852 }
const ahangama = { name: 'Ahangama Stilt Fishermen', lat: 5.973, lng: 80.37 }

export const southernBeaches: SeedTour = {
  slug: 'southern-beaches-whale-trails',
  title: 'Pristine Southern Beaches & Whale Trails',
  summary:
    'Five unhurried nights along the southern coast — Galle Fort’s ramparts, a cinnamon island boat safari, stilt fishermen at sunset, blue whales off Mirissa and secluded coves near Tangalle.',
  description: [
    'A coastal journey for travellers who want the sea in every day. We begin inside the walls of Galle Fort, follow the coast past Weligama’s surf and Mirissa’s whale grounds, and end in a quiet cove near Tangalle where the only sound at night is the surf — and, in season, nesting turtles.',
    'Drives are short, villas are chosen for their beaches, and there is always time for nothing at all.',
  ].join('\n\n'),
  cardTag: 'Coastal Luxury',
  durationDays: 6,
  durationNights: 5,
  route: ['Galle Fort', 'Weligama', 'Mirissa', 'Tangalle'],
  highlights: [
    'Private Stilt Fishermen Encounter',
    'Cinnamon Island Boat Safari',
    'Sunset Oceanfront Dining',
  ],
  badges: ['Coastal Luxury', 'Whale Season', 'Private Chauffeur-Guide'],
  overview: {
    kicker: 'Coastal Sanctuaries',
    heading: 'Ramparts, Whales and Hidden Coves',
    quote:
      'On the south coast the best plans leave room for the tide, the light and a long lunch under the palms.',
  },
  keyFeatures: [
    {
      icon: 'fort',
      title: 'Galle Fort Living',
      text: 'Two nights inside the UNESCO walls in a restored merchant villa.',
    },
    {
      icon: 'sailing',
      title: 'Whales & Cinnamon Islands',
      text: 'A private whale charter and a Madu Ganga boat safari.',
    },
    {
      icon: 'beach_access',
      title: 'Hand-Picked Beaches',
      text: 'Villas chosen for safe swimming and quiet sand.',
    },
    {
      icon: 'restaurant',
      title: 'Oceanfront Dining',
      text: 'Sunset seafood dinners with your feet in the sand.',
    },
  ],
  included: [
    guideIncluded,
    vehicleIncluded,
    {
      icon: 'sailing',
      text: 'Private whale-watching charter off Mirissa and a Madu Ganga cinnamon island boat safari',
    },
    accommodation(5, 'in beachfront villas and a Galle Fort heritage hotel, with breakfasts and dinners'),
    refreshmentsIncluded,
  ],
  notIncluded: standardNotIncluded,
  routeSummary: '330 Kilometers · 120 km of Indian Ocean Coastline',
  travellerTypes: ['couple', 'family', 'solo', 'group'],
  seasons: ['nov-apr'],
  cover: 'tour-southern-beaches-cover',
  gallery: [
    {
      image: 'gallery-galle-ramparts-indigo',
      title: 'Ramparts in Indigo',
      caption: 'Galle Fort at twilight',
    },
    {
      image: 'gallery-stilt-fishermen-dusk',
      title: 'Riti Panna Twilight',
      caption: 'Stilt fishermen at dusk',
    },
    { image: 'dest-mirissa-blue-whale', title: 'Blue Whale', caption: 'Off the Mirissa shelf' },
    { image: 'gallery-tangalle-cove', title: 'Tangalle Cove', caption: 'White sand and leaning palms' },
  ],
  days: [
    {
      title: 'Arrival & Sunset on the Galle Fort Ramparts',
      description:
        'The Southern Expressway brings us to Galle in about two and a half hours. After checking into a restored villa inside the fort, we walk the ramparts to Flag Rock for sunset.',
      drivingTime: 'Drive: ~2.5 hrs via Highway',
      meals: 'Dinner',
      overnightArea: 'Galle Fort',
      details: [{ label: 'Sunset Highlight', value: 'Rampart walk to Flag Rock Bastion' }],
      stops: [P.airport, P.galleFort],
    },
    {
      title: 'Cinnamon Islands of the Madu Ganga',
      description:
        'A morning boat safari through the mangrove channels of the Madu Ganga to a tiny island where a family peels cinnamon by hand. Afternoon in the fort’s lanes, galleries and courtyard cafés.',
      drivingTime: 'Drive: ~1 hr each way',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Galle Fort',
      details: [{ label: 'Private Boat', value: 'Shaded wooden boat with refreshments' }],
      stops: [P.galleFort, P.maduGanga],
    },
    {
      title: 'Stilt Fishermen & the Surf Town of Weligama',
      description:
        'Along the coast to Ahangama for an unhurried morning with a stilt-fishing family, then lunch and an afternoon on Weligama’s gentle surf (lessons available). Evening arrival at a Mirissa beach villa.',
      drivingTime: 'Drive: ~1 hr',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Mirissa',
      details: [{ label: 'Curated Highlight', value: 'Private stilt fishermen encounter' }],
      stops: [ahangama, P.weligama, P.mirissa],
    },
    {
      title: 'Blue Whales at Dawn & Coconut Tree Hill',
      description:
        'A private yacht out to the continental shelf at sunrise to look for blue whales and dolphins with a marine naturalist. Long lunch, a swim, and a golden-hour walk up Coconut Tree Hill.',
      drivingTime: 'At Sea',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Mirissa',
      isHighlight: true,
      details: [{ label: 'Season Note', value: 'Whales Nov – Apr' }],
      stops: [P.mirissa, { name: 'Coconut Tree Hill', lat: 5.9437, lng: 80.4627 }],
    },
    {
      title: 'Mulkirigala Rock Temple & Tangalle’s Hidden Coves',
      description:
        'East along the coast to Tangalle, with a climb to the cave temples of Mulkirigala on the way. In the evening, an oceanfront dinner and — in season — a quiet, guided visit to watch turtles nesting at Rekawa.',
      drivingTime: 'Drive: ~1.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Tangalle',
      details: [
        { label: 'Sunset Dining', value: 'Seafood dinner on the beach' },
        { label: 'Wildlife', value: 'Ethical turtle watch at Rekawa (season permitting)' },
      ],
      stops: [mulkirigala, P.tangalle, rekawa],
    },
    {
      title: 'A Last Swim & Airport Farewell',
      description: 'A final morning swim in the cove before the expressway takes us back to the airport.',
      drivingTime: 'Drive: ~3.5 hrs via Highway',
      meals: 'Breakfast',
      overnightArea: 'Departure',
      details: [{ label: 'Late Check-Out', value: 'Day room available on request' }],
      stops: [P.tangalle, P.airport],
    },
  ],
  categories: ['pristine-beaches', 'family'],
  destinations: ['galle-fort', 'mirissa-weligama'],
}
