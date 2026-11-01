/**
 * Wild Leopards & Untamed Coastlines — card copy from the design; itinerary written for the seed.
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

const wilpattu = { name: 'Wilpattu National Park', lat: 8.4333, lng: 80.0167 }
const ratnapura = { name: 'Ratnapura', lat: 6.6828, lng: 80.3992 }

export const wildLeopards: SeedTour = {
  slug: 'wild-leopards-untamed-coastlines',
  isFeatured: true,
  title: 'Wild Leopards & Untamed Coastlines',
  summary:
    'Immersive expedition for wildlife photographers and conservation enthusiasts. Private trackers, custom open-sided 4x4 safaris, and private coastal yacht charters for sperm and blue whale sightings.',
  description: [
    'Privileged leopard tracking in Yala and Wilpattu, secluded glamping pavilions, and azure whale migrations off Mirissa. This is the journey I design for travellers who measure a day by the light — dawn and dusk drives, long patient waits and the thrill of a leopard stepping out of the scrub.',
    'Between the parks we slow down: Udawalawe’s elephant herds, Bundala’s flamingos and, to finish, a small private yacht out to the blue whale highway off the southern coast.',
  ].join('\n\n'),
  cardTag: 'Private 4x4 Jeep',
  durationDays: 8,
  durationNights: 7,
  route: ['Colombo', 'Wilpattu', 'Udawalawe', 'Yala', 'Mirissa'],
  highlights: ['Private Naturalist Guide', 'Blue Whale Yacht Charter', 'Luxury Tented Safari Camp'],
  badges: ['Wildlife & Coastal Wilderness', 'Private Naturalist', 'Ethical Safari Standard'],
  overview: {
    kicker: 'Wildlife & Coastal Wilderness',
    heading: 'Three National Parks and the Blue Whale Highway',
    quote:
      'A good safari is mostly silence: the engine off, the tracker listening for a langur’s alarm call, and then a leopard walking out of the shade as if it owned the morning — which it does.',
  },
  keyFeatures: [
    {
      icon: 'pets',
      title: 'Three National Parks',
      text: 'Wilpattu, Udawalawe and Yala, each with private open 4x4 drives.',
    },
    {
      icon: 'visibility',
      title: 'Senior Trackers',
      text: 'Naturalists who read tracks and alarm calls rather than radio chatter.',
    },
    {
      icon: 'sailing',
      title: 'Private Whale Charter',
      text: 'A small vessel with a marine conservationist off Mirissa.',
    },
    {
      icon: 'holiday_village',
      title: 'Luxury Tented Camps',
      text: 'Canvas suites on the park edges, lantern dinners under the stars.',
    },
  ],
  included: [
    guideIncluded,
    vehicleIncluded,
    {
      icon: 'pets',
      text: 'Private open 4x4 safaris in Wilpattu, Udawalawe and Yala with park fees and senior trackers',
    },
    {
      icon: 'sailing',
      text: 'Private yacht charter for whale watching off Mirissa (season permitting) with a marine naturalist',
    },
    accommodation(7, 'including luxury tented safari camps, with daily breakfasts and dinners'),
    refreshmentsIncluded,
  ],
  notIncluded: standardNotIncluded,
  routeSummary: '880 Kilometers · 3 National Parks & the Southern Ocean',
  travellerTypes: ['couple', 'solo', 'group', 'family'],
  seasons: ['nov-apr', 'may-sep'],
  cover: 'tour-wild-leopards-cover',
  gallery: [
    {
      image: 'tour-wild-leopards-wilpattu-elephants',
      title: 'Wilpattu at Sunset',
      caption: 'An elephant mother and newborn calf',
    },
    {
      image: 'tour-wild-leopards-yala-outcrop',
      title: 'Yala Leopard',
      caption: 'Golden hour on the granite outcrops',
    },
    {
      image: 'gallery-udawalawe-tusker',
      title: 'Udawalawe Tusker',
      caption: 'Open grasslands in the afternoon',
    },
    {
      image: 'corp-blueprint-yala-glamping',
      title: 'Tented Camp',
      caption: 'A waterhole view from your canvas suite',
    },
    { image: 'gallery-blue-whale-fluke', title: 'Titan of the Trench', caption: 'Blue whale off Mirissa' },
  ],
  days: [
    {
      title: 'Arrival & Into the Lakes of Wilpattu',
      description:
        'From the airport we drive north along the coast to a tented camp on the edge of Wilpattu, Sri Lanka’s largest national park. Late-afternoon safari among its natural lakes, the villus, looking for leopards and sloth bears.',
      drivingTime: 'Drive: ~3.5 hrs',
      meals: 'Lunch, Dinner',
      overnightArea: 'Wilpattu',
      details: [{ label: 'Overnight Residence', value: 'Luxury tented camp near Hunuwilagama gate' }],
      stops: [P.airport, wilpattu],
    },
    {
      title: 'A Full Day in Wilpattu’s Wilderness',
      description:
        'Dawn and dusk drives with a picnic breakfast beside a villu. Wilpattu sees a fraction of Yala’s visitors, so sightings are quiet and unhurried — leopards, sloth bears, spotted deer and crocodiles basking on the banks.',
      drivingTime: 'Full Day Safari',
      meals: 'Breakfast, Picnic Lunch, Dinner',
      overnightArea: 'Wilpattu',
      isHighlight: true,
      details: [{ label: 'Wildlife', value: 'Leopards, sloth bears & lake birdlife' }],
      stops: [wilpattu],
    },
    {
      title: 'Across the Island via the Gem Town of Ratnapura',
      description:
        'A long but scenic transfer south, broken with lunch in Ratnapura, the city of gems, and a look at traditional gem pits. Evening arrival at Udawalawe.',
      drivingTime: 'Drive: ~6 hrs with breaks',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Udawalawe',
      details: [{ label: 'Curated Stop', value: 'Traditional gem-pit visit near Ratnapura' }],
      stops: [wilpattu, ratnapura, P.udawalawe],
    },
    {
      title: 'Udawalawe Elephants & Onward to Yala',
      description:
        'A dawn drive among Udawalawe’s grazing elephant herds and a visit to the Elephant Transit Home at feeding time, then on to a tented camp on the edge of Yala for a sunset drink by the waterhole.',
      drivingTime: 'Drive: ~2.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Yala',
      details: [{ label: 'Conservation', value: 'Elephant Transit Home feeding time' }],
      stops: [P.udawalawe, P.elephantTransitHome, P.yala],
    },
    {
      title: 'Yala: Leopard Country from First Light',
      description:
        'We enter at gate opening with a senior tracker and stay out until late morning, then return in the afternoon — exploring quieter blocks so that every sighting is calm and engine-off.',
      drivingTime: 'Full Day Safari',
      meals: 'Breakfast, Lunch, Dinner',
      overnightArea: 'Yala',
      details: [
        { label: 'Private 4x4', value: 'Modified open vehicle for your party only' },
        { label: 'Ethics', value: 'Engine-off sightings, no crowding' },
      ],
      stops: [P.yala],
    },
    {
      title: 'Bundala Flamingos & the Road to Mirissa',
      description:
        'An early birding walk at Bundala’s salt pans — flamingos, painted storks and waders in season — then west along the coast to a beach villa in Mirissa. Afternoon free.',
      drivingTime: 'Drive: ~2.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Mirissa',
      details: [{ label: 'Birding', value: 'Telephoto optics in the vehicle' }],
      stops: [P.bundala, P.mirissa],
    },
    {
      title: 'Private Yacht to the Blue Whale Highway',
      description:
        'Out at sunrise on a small private yacht with a marine naturalist to look for blue and sperm whales and spinner dolphins. The afternoon is for the beach, the pool or a sunset at Coconut Tree Hill.',
      drivingTime: 'At Sea',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Mirissa',
      details: [
        { label: 'Season Note', value: 'Whales Nov – Apr; dolphin and coastal cruise outside the season' },
      ],
      stops: [P.mirissa, { name: 'Mirissa Continental Shelf', lat: 5.85, lng: 80.48 }],
    },
    {
      title: 'Coastal Expressway & Airport Farewell',
      description:
        'A relaxed breakfast by the sea, then the expressway north to the airport. A Galle Fort lunch stop can be added for later flights.',
      drivingTime: 'Drive: ~3 hrs via Highway',
      meals: 'Breakfast',
      overnightArea: 'Departure',
      details: [{ label: 'Option', value: 'Lunch and a walk in Galle Fort for evening flights' }],
      stops: [P.mirissa, P.airport],
    },
  ],
  categories: ['wildlife-safari', 'pristine-beaches'],
  destinations: ['udawalawe', 'yala-bundala', 'mirissa-weligama'],
}
