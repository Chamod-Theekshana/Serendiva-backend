/**
 * Bespoke Ceylon Honeymoon & Seclusion — card copy from the design; itinerary written for the seed.
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

export const honeymoon: SeedTour = {
  slug: 'bespoke-ceylon-honeymoon',
  title: 'Bespoke Ceylon Honeymoon & Seclusion',
  summary:
    'Couples’ sanctuaries, secluded private pools, candlelit ruins dinners, and unscripted leisurely ocean strolls — from the Cultural Triangle to the tea hills of Ella and a hidden cove near Tangalle.',
  description: [
    'A honeymoon should feel like it was made for two people only — and this one is. I choose villas for their privacy rather than their star rating, keep the driving light and leave every afternoon open.',
    'Expect a candlelit dinner within sight of Sigiriya, a couples’ Ayurveda ritual, a reserved observation carriage through the tea country, three nights in a cliffside hideaway in Ella and a lantern-lit seafood dinner on a deserted cove.',
  ].join('\n\n'),
  cardTag: 'Secluded Villas',
  durationDays: 10,
  durationNights: 9,
  route: ['Negombo', 'Cultural Triangle', 'Kandy', 'Ella', 'Tangalle'],
  highlights: ['Private Candlelit Sigiriya Dinner', 'Couples Ayurvedic Rituals', 'Luxury Coastal Hideaways'],
  badges: ['Romantic Sanctuary', 'Secluded Villas', 'Private Chauffeur-Guide'],
  overview: {
    kicker: 'Romantic Sanctuary',
    heading: 'Ten Days, Two Travellers, No Crowds',
    quote:
      'The most romantic moments here are rarely planned to the minute: a sudden shower over the tea, a king coconut at a mountain bend, the first stars over the Indian Ocean. I simply make sure you are in the right place for them.',
  },
  keyFeatures: [
    {
      icon: 'favorite',
      title: 'Couples’ Moments',
      text: 'A candlelit Sigiriya dinner and a lantern-lit beach supper.',
    },
    {
      icon: 'spa',
      title: 'Ayurveda for Two',
      text: 'Side-by-side treatments with a resident physician’s guidance.',
    },
    { icon: 'pool', title: 'Private Pools', text: 'Villas with plunge or infinity pools wherever possible.' },
    {
      icon: 'train',
      title: 'Observation Carriage',
      text: 'The scenic train from Kandy to Ella in reserved seats.',
    },
  ],
  included: [
    guideIncluded,
    vehicleIncluded,
    trainIncluded,
    { icon: 'spa', text: 'One couples’ Ayurvedic ritual and a private candlelit dinner near Sigiriya' },
    {
      icon: 'hotel',
      text: '9 nights in secluded boutique villas and hideaways with daily breakfasts and curated dinners',
    },
    refreshmentsIncluded,
  ],
  notIncluded: standardNotIncluded,
  routeSummary: '760 Kilometers · Lagoon, Rock, Mist & Ocean',
  travellerTypes: ['couple'],
  seasons: ['nov-apr'],
  cover: 'tour-honeymoon-cover',
  gallery: [
    {
      image: 'tour-honeymoon-oceanfront-villa',
      title: 'Oceanfront Villa',
      caption: 'Infinity pool beneath the palms',
    },
    {
      image: 'quiz-couple-plunge-pool',
      title: 'Candlelit Plunge Pool',
      caption: 'Evening in the Ella hills',
    },
    {
      image: 'home-craft-high-tea-pavilion',
      title: 'High Tea for Two',
      caption: 'A cliffside pavilion above the estates',
    },
    {
      image: 'cat-honeymoon-villa-pool',
      title: 'Lantern Light',
      caption: 'An open-air pool above the ocean',
    },
  ],
  days: [
    {
      title: 'Arrival & a Lagoon Sunset in Negombo',
      description:
        'A private welcome at the airport and a short transfer to a lagoon-side villa. At sunset, a traditional oruwa boat glides you across the still water with a glass of something cold.',
      drivingTime: 'Drive: ~25 mins',
      meals: 'Welcome Dinner',
      overnightArea: 'Negombo',
      details: [{ label: 'Curated Highlight', value: 'Sunset oruwa boat on the lagoon' }],
      stops: [P.airport, P.negombo],
    },
    {
      title: 'To the Cultural Triangle & an Ayurveda Ritual for Two',
      description:
        'We drive inland to a secluded villa near Sigiriya. In the afternoon, a resident Ayurvedic physician prepares a side-by-side ritual of warm herbal oils and a flower bath.',
      drivingTime: 'Drive: ~3.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Sigiriya',
      details: [{ label: 'Wellness', value: 'Couples’ Ayurvedic ritual' }],
      stops: [P.negombo, P.sigiriya],
    },
    {
      title: 'Sigiriya at Dawn & a Candlelit Dinner Beneath the Rock',
      description:
        'An early, cool climb of the Lion Rock before the crowds (or a sunrise from Pidurangala), a lazy afternoon by the pool and, at night, a private candlelit dinner within sight of the floodlit citadel.',
      drivingTime: 'Leisurely Day',
      meals: 'Breakfast, Private Dinner',
      overnightArea: 'Sigiriya',
      isHighlight: true,
      details: [{ label: 'Romantic Highlight', value: 'Private candlelit Sigiriya dinner' }],
      stops: [P.sigiriya, P.pidurangala],
    },
    {
      title: 'Kandy & the Evening Puja',
      description:
        'Through the spice gardens of Matale to Kandy. In the evening we join the drum ceremony at the Temple of the Tooth, then dine above the lake.',
      drivingTime: 'Drive: ~3 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Kandy',
      details: [{ label: 'Attire Prep', value: 'White wraps provided' }],
      stops: [P.matale, P.kandyTemple],
    },
    {
      title: 'The Observation Carriage to Ella',
      description:
        'The full scenic railway from Kandy to Ella in reserved seats — tea estates, waterfalls and cloud forest for most of the day — while your luggage travels ahead to a cliffside villa.',
      drivingTime: 'Train: ~6.5 hrs',
      meals: 'Breakfast, Picnic Lunch, Dinner',
      overnightArea: 'Ella',
      details: [{ label: 'Luggage Care', value: 'Transported separately by car' }],
      stops: [P.peradeniya, P.nanuOya, P.ella],
    },
    {
      title: 'Little Adam’s Peak at Sunrise & a Spa Afternoon',
      description:
        'A gentle lantern-lit climb for sunrise over the Ella Gap, breakfast on your terrace, and an afternoon of spa treatments and doing absolutely nothing.',
      drivingTime: 'Highland Leisure',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Ella',
      details: [{ label: 'Curated Highlight', value: 'Sunrise from the eastern rock bench' }],
      stops: [P.littleAdams],
    },
    {
      title: 'Tea Tasting & the Nine Arches Bridge',
      description:
        'A private tasting in a planter’s bungalow, then the Nine Arches Bridge from a quiet tea terrace as the blue train passes. Dinner by candlelight in your villa.',
      drivingTime: 'Short Drives',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Ella',
      details: [{ label: 'Culinary', value: 'Private in-villa candlelit dinner' }],
      stops: [P.nineArches, P.ella],
    },
    {
      title: 'Down to the Sea at Tangalle',
      description:
        'We descend past Ravana Falls to the south coast and a secluded villa above a quiet cove near Tangalle. The afternoon is for the pool and the sea.',
      drivingTime: 'Drive: ~3 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Tangalle',
      details: [{ label: 'Overnight Residence', value: 'Clifftop villa with private pool' }],
      stops: [P.ravanaFalls, P.tangalle],
    },
    {
      title: 'A Lantern-Lit Seafood Dinner on a Deserted Cove',
      description:
        'A free day by the ocean. At dusk I set up a lantern-lit seafood dinner on a hidden cove, just for the two of you; in season, we can quietly watch turtles nesting afterwards.',
      drivingTime: 'Leisure Day',
      meals: 'Breakfast, Private Beach Dinner',
      overnightArea: 'Tangalle',
      details: [{ label: 'Romantic Highlight', value: 'Private lantern-lit beach dinner' }],
      stops: [P.tangalle],
    },
    {
      title: 'Farewell from the South Coast',
      description: 'A last swim and breakfast before the expressway takes us back to the airport.',
      drivingTime: 'Drive: ~3.5 hrs via Highway',
      meals: 'Breakfast',
      overnightArea: 'Departure',
      details: [{ label: 'Farewell', value: 'Ceylon tea and spice gift box' }],
      stops: [P.tangalle, P.airport],
    },
  ],
  categories: ['honeymoon', 'ayurveda-wellness'],
  destinations: ['sigiriya-dambulla', 'kandy-knuckles', 'ella'],
}
