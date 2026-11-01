/**
 * Tea Mist, Monasteries & Colonial Charms — card copy from the design; itinerary written for the seed.
 * Duration/route follow the tours page and the Ella page (6N/7D, Kandy 2N → Nuwara Eliya 2N → Ella 2N);
 * the Hatton tea valley is visited on the scenic road from Kandy to Nuwara Eliya.
 *
 * PLACEHOLDER SAMPLE CONTENT — to be reviewed/replaced by the client.
 */
import type { SeedTour } from '../types'
import {
  P,
  guideIncluded,
  refreshmentsIncluded,
  standardNotIncluded,
  trainIncluded,
  vehicleIncluded,
} from './common'

const forestHermitage = { name: 'Nilambe Meditation Centre', lat: 7.1906, lng: 80.6311 }

export const teaMist: SeedTour = {
  slug: 'tea-mist-monasteries-colonial-charms',
  isFeatured: true,
  title: 'Tea Mist, Monasteries & Colonial Charms',
  summary:
    'Slow down with gentle high-altitude air, artisanal tea tastings with fifth-generation estate managers, private evening prayers at the Temple of the Tooth, and misty walks between colonial planter bungalows.',
  description: [
    'Quiet hill country retreats, historic forest hermitages, exclusive Ceylon single-estate cuppings, and cool mountain breezes. This is an alpine passage focusing on historic bungalows, private cupping masterclasses, and temple meditation.',
    'We stay two nights in each place so the days never feel rushed — Kandy for its temples and gardens, Nuwara Eliya for its high-grown tea and colonial rituals, and Ella for ridge walks and the famous Nine Arches Bridge.',
  ].join('\n\n'),
  cardTag: 'Scenic Rail Included',
  durationDays: 7,
  durationNights: 6,
  route: ['Kandy', 'Hatton', 'Nuwara Eliya', 'Ella'],
  highlights: [
    'First-Class Scenic Train Tickets',
    "Heritage Tea Planter's Bungalow",
    'Private Temple Forest Blessings',
  ],
  badges: ['Highland Solitude', 'Scenic Rail Included', 'Heritage Bungalows'],
  overview: {
    kicker: 'Highland Terroir Expedition',
    heading: 'An Alpine Passage Through Ceylon’s Tea Country',
    quote:
      'Up here the island breathes more slowly. Mist fills the valleys at four o’clock, the kettle goes on, and somewhere below a train whistles on its way to Ella.',
  },
  keyFeatures: [
    {
      icon: 'local_cafe',
      title: 'Single-Estate Cuppings',
      text: 'Private tastings with planters and master tea-makers.',
    },
    {
      icon: 'cottage',
      title: 'Heritage Bungalows',
      text: 'Log fires, butlers and croquet lawns above the mist.',
    },
    {
      icon: 'train',
      title: 'Observation Carriage',
      text: 'Reserved first-class seats on the Nanu Oya to Ella line.',
    },
    {
      icon: 'self_improvement',
      title: 'Forest Hermitage Blessing',
      text: 'A quiet blessing and meditation with forest monks.',
    },
  ],
  included: [
    guideIncluded,
    vehicleIncluded,
    trainIncluded,
    {
      icon: 'confirmation_number',
      text: 'Temple of the Tooth, Peradeniya gardens and tea factory admissions',
    },
    {
      icon: 'hotel',
      text: '6 nights in heritage tea bungalows and boutique hill-country hotels with breakfasts and dinners',
    },
    refreshmentsIncluded,
  ],
  notIncluded: standardNotIncluded,
  routeSummary: '410 Kilometers · 500m to 1,868m Elevation',
  travellerTypes: ['couple', 'solo', 'family', 'group'],
  seasons: ['nov-apr', 'jul-aug'],
  cover: 'tour-tea-mist-cover',
  gallery: [
    {
      image: 'tour-tea-mist-planter-veranda',
      title: 'The Planter’s Veranda',
      caption: 'Tea valleys and distant waterfalls',
    },
    { image: 'tour-tea-mist-victorian-bungalow', title: 'Victorian Bungalow', caption: 'Roses in the mist' },
    { image: 'dest-ella-nine-arches-train', title: 'Nine Arches Bridge', caption: 'The blue train in Ella' },
    {
      image: 'gallery-temple-tooth-lamps',
      title: 'Evening Thevava',
      caption: 'Lamps at the Temple of the Tooth',
    },
  ],
  days: [
    {
      title: 'Arrival & the Royal City of Kandy',
      description:
        'From the airport we climb gently to Kandy, with a stop for a late lunch overlooking the river. In the evening, dressed in white, we attend the puja at the Temple of the Sacred Tooth Relic.',
      drivingTime: 'Drive: ~3 hrs',
      meals: 'Lunch, Dinner',
      overnightArea: 'Kandy',
      details: [{ label: 'Attire Prep', value: 'White wraps provided for the temple' }],
      stops: [P.airport, P.kandyTemple],
    },
    {
      title: 'Peradeniya Gardens & a Forest Hermitage Blessing',
      description:
        'A morning among the giant fig trees and orchid houses of Peradeniya, then into the hills above Kandy to a forest hermitage, where a monk offers a quiet blessing and a short guided meditation.',
      drivingTime: 'Drive: ~1.5 hrs in total',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Kandy',
      details: [{ label: 'Curated Highlight', value: 'Private blessing at a forest hermitage' }],
      stops: [P.peradeniya, forestHermitage],
    },
    {
      title: 'The Hatton Tea Valley & Lunch in a Planter’s Bungalow',
      description:
        'The scenic road to Nuwara Eliya winds through the Hatton tea valley, where we stop for a long lunch in a heritage planter’s bungalow with views to Adam’s Peak. Late-afternoon arrival in “Little England”.',
      drivingTime: 'Drive: ~4 hrs with lunch',
      meals: 'Breakfast, Lunch, Dinner',
      overnightArea: 'Nuwara Eliya',
      isHighlight: true,
      details: [
        { label: 'Curated Highlight', value: 'Planter’s lunch in the Hatton valley' },
        { label: 'Overnight Residence', value: 'Heritage tea bungalow' },
      ],
      stops: [P.kandyTemple, P.hatton, P.nuwaraEliya],
    },
    {
      title: 'Single-Estate Cupping & Colonial Nuwara Eliya',
      description:
        'A morning in the fields and factory of a high-grown estate, finishing with a cupping masterclass. The afternoon is for Gregory Lake, the red-brick post office and high tea on the lawn of a colonial club.',
      drivingTime: 'Highland Leisure',
      meals: 'Breakfast, High Tea, Dinner',
      overnightArea: 'Nuwara Eliya',
      details: [{ label: 'Masterclass', value: 'Silver Tips to BOP with the tea-maker' }],
      stops: [P.pedro, P.gregoryLake],
    },
    {
      title: 'The Observation Train from Nanu Oya to Ella',
      description:
        'Reserved first-class seats for the most beautiful stretch of the hill-country railway, through tunnels, tea estates and cloud forest. Your luggage follows by car, and the evening is spent on your villa terrace above the Ella Gap.',
      drivingTime: 'Train: ~3.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Ella',
      details: [{ label: 'Luggage Care', value: 'Transported separately by car' }],
      stops: [P.nanuOya, P.ella],
    },
    {
      title: 'Little Adam’s Peak, Nine Arches & Ravana Falls',
      description:
        'Sunrise from Little Adam’s Peak, breakfast back at the villa, then the Nine Arches Bridge from a private tea terrace as the blue train crosses. A cooling stop at Ravana Falls in the afternoon.',
      drivingTime: 'Short Drives',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Ella',
      details: [{ label: 'Curated Highlight', value: 'Nine Arches from a private tea terrace' }],
      stops: [P.littleAdams, P.nineArches, P.ravanaFalls],
    },
    {
      title: 'Farewell to the Highlands',
      description:
        'A leisurely breakfast with the valley view, then we descend through Wellawaya to the Southern Expressway and on to the airport — or extend to the south coast or Yala.',
      drivingTime: 'Drive: ~6 hrs',
      meals: 'Breakfast',
      overnightArea: 'Departure',
      details: [{ label: 'Extension', value: 'Yala safari or Galle Fort nights on request' }],
      stops: [P.ella, P.airport],
    },
  ],
  categories: ['hill-country'],
  destinations: ['kandy-knuckles', 'nuwara-eliya', 'ella'],
}
