/**
 * Ceylon Family Wonder & Discovery — card copy from the design; itinerary written for the seed.
 * Udawalawe (for the "Ethical Elephant Sanctuary Day") is added between Kandy and Bentota.
 *
 * PLACEHOLDER SAMPLE CONTENT — to be reviewed/replaced by the client.
 */
import type { SeedTour } from '../types'
import { P, accommodation, guideIncluded, refreshmentsIncluded, standardNotIncluded } from './common'

const galleFace = { name: 'Galle Face Green', lat: 6.9246, lng: 79.8455 }
const hiriwadunna = { name: 'Hiriwadunna Village', lat: 8.0233, lng: 80.7392 }

export const familyWonder: SeedTour = {
  slug: 'ceylon-family-wonder-discovery',
  title: 'Ceylon Family Wonder & Discovery',
  summary:
    'Eleven gentle days built around children and grandparents alike: wild elephants from the safari jeep, a village day by bullock cart and canoe, junior naturalist kits, a turtle hatchery and safe surf and kayak sessions on the west coast.',
  description: [
    'Travelling with children in the tropics is all about rhythm. I keep driving legs short, plan the big outings for the cool mornings and leave the afternoons for the pool. Every child gets a junior naturalist kit — binoculars, a field notebook and a checklist of animals to spot.',
    'Spacious air-conditioned vehicles, connecting rooms or villas, child seats and a flexible plan mean that grandparents travel as comfortably as the youngest explorers.',
  ].join('\n\n'),
  cardTag: 'All Ages',
  durationDays: 11,
  durationNights: 10,
  route: ['Colombo', 'Sigiriya', 'Kandy', 'Udawalawe', 'Bentota'],
  highlights: [
    'Ethical Elephant Sanctuary Day',
    'Junior Naturalist Safari Kits',
    'Kid-Friendly Surfing & Kayak',
  ],
  badges: ['Multi-Generational', 'All Ages', 'Gentle Pacing'],
  overview: {
    kicker: 'Multi-Generational',
    heading: 'A Journey the Whole Family Will Retell for Years',
    quote:
      'The best moment of a family trip is often small: a child counting elephants out loud, or a grandmother teaching everyone to eat rice and curry with their fingers.',
  },
  keyFeatures: [
    {
      icon: 'child_care',
      title: 'Junior Naturalist Kits',
      text: 'Binoculars, field notebooks and spotting checklists for every child.',
    },
    {
      icon: 'pets',
      title: 'Ethical Wildlife Only',
      text: 'Wild elephants from the jeep — never rides or shows.',
    },
    {
      icon: 'airport_shuttle',
      title: 'Spacious VIP Van',
      text: 'Child seats, extra legroom and a cool box of fruit and water.',
    },
    { icon: 'pool', title: 'Afternoons Off', text: 'Big outings in the morning, pool time when it is hot.' },
  ],
  included: [
    guideIncluded,
    {
      icon: 'airport_shuttle',
      text: 'Private air-conditioned VIP family van with child seats, unlimited mileage, tolls and fuel',
    },
    {
      icon: 'pets',
      text: 'Private jeep safaris in Minneriya and Udawalawe and the Elephant Transit Home visit',
    },
    {
      icon: 'surfing',
      text: 'Kid-friendly surf lesson and river kayak session in Bentota with certified instructors',
    },
    accommodation(10, 'with family rooms or villas, daily breakfasts and dinners'),
    refreshmentsIncluded,
  ],
  notIncluded: standardNotIncluded,
  routeSummary: '780 Kilometers · Short Driving Legs',
  travellerTypes: ['family', 'group'],
  seasons: ['nov-apr', 'jul-aug'],
  cover: 'tour-family-wonder-cover',
  gallery: [
    { image: 'cat-family-udawalawe', title: 'Elephant Calves', caption: 'Udawalawe from the safari jeep' },
    { image: 'quiz-family-minneriya', title: 'Minneriya Gathering', caption: 'A matriarch and calf' },
    {
      image: 'gallery-thambili-polonnaruwa',
      title: 'Thambili & Tales',
      caption: 'King coconuts in Polonnaruwa',
    },
    {
      image: 'review-chen-family-portrait',
      title: 'Safari Smiles',
      caption: 'A family on the open-roof jeep',
    },
  ],
  days: [
    {
      title: 'Arrival & Kites on Galle Face Green',
      description:
        'A short transfer to a Colombo hotel to rest after the flight. In the late afternoon we join local families flying kites on Galle Face Green, with isso vadai and fresh juice by the sea.',
      drivingTime: 'Drive: ~45 mins',
      meals: 'Dinner',
      overnightArea: 'Colombo',
      details: [{ label: 'Curated Highlight', value: 'Sunset kites on Galle Face Green' }],
      stops: [P.airport, galleFace],
    },
    {
      title: 'To the Cultural Triangle',
      description:
        'A gentle drive north with stops for fruit stalls and a village pottery where children can try the wheel. Arrival at a family villa near Sigiriya with time for a swim.',
      drivingTime: 'Drive: ~4 hrs with breaks',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Sigiriya',
      details: [{ label: 'Hands-On', value: 'Village pottery wheel session' }],
      stops: [P.colombo, P.dambulla, P.sigiriya],
    },
    {
      title: 'A Village Day: Bullock Cart, Canoe & Cooking',
      description:
        'A morning in Hiriwadunna village — a bullock-cart ride, a canoe across the lake and a cooking session with a local family. In the cool of the evening, an easy climb of Pidurangala or the Sigiriya water gardens.',
      drivingTime: 'Short Drives',
      meals: 'Breakfast, Village Lunch, Dinner',
      overnightArea: 'Sigiriya',
      details: [{ label: 'Option', value: 'Sigiriya climb with accessible alternatives for grandparents' }],
      stops: [hiriwadunna, P.sigiriya],
    },
    {
      title: 'Elephant Gathering Safari & Polonnaruwa by Bike',
      description:
        'Children receive their junior naturalist kits before a morning safari to see elephants on the grasslands of Minneriya. Afternoon cycle among the ruins of Polonnaruwa on flat, shaded paths.',
      drivingTime: 'Drive: ~1 hr each way',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Sigiriya',
      isHighlight: true,
      details: [
        { label: 'Wildlife', value: 'Private jeep safari in Minneriya' },
        { label: 'Kids', value: 'Junior naturalist kits handed out' },
      ],
      stops: [P.minneriya, P.polonnaruwa],
    },
    {
      title: 'Spice Gardens & Kandyan Dancers',
      description:
        'On to Kandy via a spice garden where children can smell and taste cinnamon, cardamom and vanilla. In the evening, a lively performance of Kandyan drumming and fire dancing.',
      drivingTime: 'Drive: ~3 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Kandy',
      details: [{ label: 'Evening', value: 'Kandyan dance and fire-walking show' }],
      stops: [P.matale, P.kandyTemple],
    },
    {
      title: 'Peradeniya Gardens & the Temple of the Tooth',
      description:
        'The botanic gardens are perfect for running around — giant bamboo, a suspension bridge and fruit bats in the trees. In the afternoon a short visit to the Temple of the Tooth.',
      drivingTime: 'Short Drives',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Kandy',
      details: [{ label: 'Attire Prep', value: 'Light wraps for the temple provided' }],
      stops: [P.peradeniya, P.kandyTemple],
    },
    {
      title: 'Down to Udawalawe & the Elephant Transit Home',
      description:
        'A scenic drive south to Udawalawe, arriving in time for feeding at the Elephant Transit Home, where orphaned calves are cared for until they can return to the wild.',
      drivingTime: 'Drive: ~5 hrs with breaks',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Udawalawe',
      details: [{ label: 'Conservation', value: 'Ethical, hands-off sanctuary visit' }],
      stops: [P.kandyTemple, P.elephantTransitHome],
    },
    {
      title: 'Dawn Safari & On to the West Coast',
      description:
        'An early jeep safari among Udawalawe’s grazing herds, then a drive west to a family-friendly beach villa in Bentota.',
      drivingTime: 'Drive: ~3.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Bentota',
      details: [{ label: 'Wildlife', value: 'Private jeep safari in Udawalawe' }],
      stops: [P.udawalawe, P.bentota],
    },
    {
      title: 'Turtles, Surf & River Kayaks',
      description:
        'A morning at the Kosgoda turtle hatchery, then a surf lesson for beginners on a gentle break and a kayak trip on the calm Bentota river in the afternoon.',
      drivingTime: 'Short Drives',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Bentota',
      details: [{ label: 'Activities', value: 'Certified surf and kayak instructors' }],
      stops: [P.kosgoda, P.bentota],
    },
    {
      title: 'A Lazy Beach Day',
      description:
        'A day with nothing planned: sandcastles, the pool and a final family dinner by the sea. Optional visit to Bawa’s Lunuganga garden for the grown-ups.',
      drivingTime: 'Leisure Day',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Bentota',
      details: [{ label: 'Option', value: 'Lunuganga garden tour' }],
      stops: [P.bentota, P.lunuganga],
    },
    {
      title: 'Farewell & Airport Transfer',
      description: 'A short drive to the airport, timed around your flight, with snacks for the plane.',
      drivingTime: 'Drive: ~1.5 hrs via Highway',
      meals: 'Breakfast',
      overnightArea: 'Departure',
      details: [{ label: 'Farewell', value: 'Junior naturalist certificates for the children' }],
      stops: [P.bentota, P.airport],
    },
  ],
  categories: ['family'],
  destinations: [
    'colombo',
    'sigiriya-dambulla',
    'anuradhapura-polonnaruwa',
    'kandy-knuckles',
    'udawalawe',
    'bentota',
  ],
}
