/**
 * Highland Trekking & Cloud Forest Peaks — card copy from the design; itinerary written for the seed.
 * The design lists Knuckles (2N) → Horton Plains (1N) → Adam's Peak (1N) → Ella (3N); Adam's Peak is
 * climbed before Horton Plains here to avoid backtracking across the hills.
 *
 * PLACEHOLDER SAMPLE CONTENT — to be reviewed/replaced by the client.
 */
import type { SeedTour } from '../types'
import { P, guideIncluded, refreshmentsIncluded, standardNotIncluded, vehicleIncluded } from './common'

const knuckles = { name: 'Knuckles Conservation Forest (Riverston)', lat: 7.528, lng: 80.735 }
const pitawala = { name: 'Pitawala Pathana', lat: 7.5476, lng: 80.7426 }
const meemure = { name: 'Meemure Village', lat: 7.4283, lng: 80.8411 }
const dalhousie = { name: 'Dalhousie (Nallathanni)', lat: 6.8282, lng: 80.5254 }
const adamsPeak = { name: "Adam's Peak (Sri Pada)", lat: 6.8096, lng: 80.4994 }
const hortonPlains = { name: 'Horton Plains National Park', lat: 6.8023, lng: 80.807 }
const worldsEnd = { name: "World's End", lat: 6.7853, lng: 80.7928 }
const diyaluma = { name: 'Diyaluma Falls', lat: 6.734, lng: 81.031 }

export const highlandTrekking: SeedTour = {
  slug: 'highland-trekking-cloud-forest-peaks',
  title: 'Highland Trekking & Cloud Forest Peaks',
  summary:
    'Designed for avid hikers seeking panoramic summits, hidden waterfalls, and crisp high-altitude wilderness — the Knuckles cloud forest, the pilgrim ascent of Adam’s Peak, World’s End at dawn and three nights of ridge trails around Ella.',
  description: [
    'This is the active side of the island: ridge paths through the UNESCO-listed Knuckles range, the 5,500-step night ascent of Adam’s Peak with thousands of pilgrims, the misty escarpment of World’s End and the trails and plunge pools around Ella.',
    'Every trek is escorted by a mountain guide who knows the weather, the leeches and the best tea shops on the way down. Your vehicle follows the route, so you only ever carry a day pack.',
  ].join('\n\n'),
  cardTag: 'Mountain Escort',
  durationDays: 8,
  durationNights: 7,
  route: ['Knuckles Range', "Adam's Peak", 'Horton Plains', 'Ella'],
  highlights: [
    'Knuckles Range Trekking Permits',
    "World's End Escorted Sunrise Walk",
    'Waterfall Plunge Pools',
  ],
  badges: ['Active Naturalist Passage', 'Mountain Escort', 'Permits Included'],
  overview: {
    kicker: 'Active Naturalist Passage',
    heading: 'Summits, Cloud Forests and Waterfall Pools',
    quote:
      'Watching the sun rise from Sri Pada, with the peak’s perfect triangular shadow falling across the clouds, is worth every one of the five thousand steps.',
  },
  keyFeatures: [
    {
      icon: 'hiking',
      title: 'Escorted Treks',
      text: 'A certified mountain guide on every trail, plus permits arranged.',
    },
    {
      icon: 'landscape',
      title: 'Four Mountain Zones',
      text: 'Knuckles, Sri Pada, Horton Plains and the Ella ridges.',
    },
    {
      icon: 'water',
      title: 'Waterfall Plunge Pools',
      text: 'Swims in natural pools above Diyaluma and near Ella.',
    },
    {
      icon: 'directions_car',
      title: 'Vehicle Support',
      text: 'Your car meets you at every trailhead — day packs only.',
    },
  ],
  included: [
    guideIncluded,
    vehicleIncluded,
    {
      icon: 'hiking',
      text: 'Certified mountain guide for all treks, Knuckles and Horton Plains permits and park fees',
    },
    {
      icon: 'hotel',
      text: '7 nights in mountain lodges, a heritage bungalow and an Ella villa with breakfasts and dinners',
    },
    { icon: 'backpack', text: 'Trekking poles, rain shells, leech socks and packed trail lunches' },
    refreshmentsIncluded,
  ],
  notIncluded: standardNotIncluded,
  routeSummary: '620 Kilometers · 6 Escorted Treks up to 2,243m',
  travellerTypes: ['solo', 'couple', 'group'],
  seasons: ['nov-apr'],
  cover: 'tour-highland-trekking-cover',
  gallery: [
    {
      image: 'dest-ella-route-knuckles',
      title: 'Knuckles Range',
      caption: 'Ravines, waterfalls and cloud forest',
    },
    { image: 'gallery-worlds-end-mist', title: 'The Great Abyss', caption: "World's End, Horton Plains" },
    { image: 'quiz-interest-trekking', title: 'Cloud Forest', caption: 'Misty peaks of the Knuckles' },
    {
      image: 'dest-ella-little-adams-peak',
      title: "Little Adam's Peak",
      caption: 'Sunrise over the Ella Gap',
    },
  ],
  days: [
    {
      title: 'Arrival & Into the Knuckles Mountains',
      description:
        'We drive from the airport to a mountain lodge at Riverston on the edge of the Knuckles Conservation Forest. A short sunset walk to stretch the legs after the flight.',
      drivingTime: 'Drive: ~4.5 hrs',
      meals: 'Lunch, Dinner',
      overnightArea: 'Knuckles Range',
      details: [{ label: 'Overnight Residence', value: 'Eco-lodge at Riverston' }],
      stops: [P.airport, knuckles],
    },
    {
      title: 'Pitawala Pathana, Mini World’s End & Meemure',
      description:
        'A full day on foot: the grasslands of Pitawala Pathana, the drop at Mini World’s End and a descent to the remote village of Meemure for a home-cooked lunch beside the river.',
      drivingTime: 'Trek: ~6 hrs',
      meals: 'Breakfast, Village Lunch, Dinner',
      overnightArea: 'Knuckles Range',
      isHighlight: true,
      details: [
        { label: 'Trek Grade', value: 'Moderate · 12 km' },
        { label: 'Permits', value: 'Knuckles Conservation Forest permit included' },
      ],
      stops: [pitawala, meemure],
    },
    {
      title: 'Across the Hills to the Foot of Sri Pada',
      description:
        'A scenic drive through Kandy and the tea country to Dalhousie at the foot of Adam’s Peak. An early dinner and early night — the climb begins at 02:00.',
      drivingTime: 'Drive: ~5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: "Adam's Peak",
      details: [{ label: 'Preparation', value: 'Warm layers and head torches provided' }],
      stops: [knuckles, P.kandyTemple, dalhousie],
    },
    {
      title: 'Night Pilgrimage to the Summit of Adam’s Peak',
      description:
        'We climb by lantern light with pilgrims to reach the 2,243 m summit for sunrise and the peak’s famous triangular shadow. After breakfast and a rest, a short drive to a heritage bungalow near Horton Plains.',
      drivingTime: 'Trek: ~7 hrs return · Drive: ~3 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Horton Plains',
      details: [
        { label: 'Trek Grade', value: 'Challenging · 5,500 steps' },
        { label: 'Season Note', value: 'Pilgrim season Dec – May' },
      ],
      stops: [adamsPeak, hortonPlains],
    },
    {
      title: 'World’s End at Dawn & On to Ella',
      description:
        'An escorted sunrise walk across the Horton Plains plateau to World’s End and Baker’s Falls before the mist rises. Afternoon drive down to a villa above the Ella Gap.',
      drivingTime: 'Trek: ~3.5 hrs · Drive: ~2 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Ella',
      details: [{ label: 'Trek Grade', value: 'Easy to moderate · 9 km loop' }],
      stops: [worldsEnd, P.ella],
    },
    {
      title: 'Ella Rock by the Railway Line',
      description:
        'A classic half-day trek along the railway, through tea estates and eucalyptus to the summit of Ella Rock. The afternoon is free for a massage or a swim.',
      drivingTime: 'Trek: ~4.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Ella',
      details: [{ label: 'Trek Grade', value: 'Moderate · 8 km return' }],
      stops: [P.ellaRock],
    },
    {
      title: 'Little Adam’s Peak at Sunrise & the Pools of Diyaluma',
      description:
        'Sunrise on Little Adam’s Peak, then a drive to Koslanda and a hike to the natural plunge pools at the top of Diyaluma Falls, the island’s second-highest waterfall.',
      drivingTime: 'Drive: ~1.5 hrs each way',
      meals: 'Breakfast, Picnic Lunch, Dinner',
      overnightArea: 'Ella',
      details: [{ label: 'Curated Highlight', value: 'Swim in the upper Diyaluma pools' }],
      stops: [P.littleAdams, diyaluma],
    },
    {
      title: 'Farewell to the Mountains',
      description:
        'A slow breakfast with the valley view before the drive back to the airport — or onward to Yala or the south coast for a well-earned rest.',
      drivingTime: 'Drive: ~6 hrs',
      meals: 'Breakfast',
      overnightArea: 'Departure',
      details: [{ label: 'Extension', value: 'Beach recovery nights on request' }],
      stops: [P.ella, P.airport],
    },
  ],
  categories: ['trekking-adventure'],
  destinations: ['kandy-knuckles', 'nuwara-eliya', 'ella'],
}
