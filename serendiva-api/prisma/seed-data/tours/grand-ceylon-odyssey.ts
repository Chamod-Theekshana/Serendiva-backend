/**
 * The Grand Ceylon Odyssey — home page "Most Popular" signature itinerary. Card copy from the design;
 * the day-by-day itinerary is sample content written for the seed.
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
  trainIncluded,
  vehicleIncluded,
} from './common'

export const grandCeylonOdyssey: SeedTour = {
  slug: 'grand-ceylon-odyssey',
  isFeatured: true,
  isMostPopular: true,
  title: 'The Grand Ceylon Odyssey',
  summary:
    'The quintessential Ceylon masterpiece. Climb Sigiriya at sunrise before the heat, wander sacred tooth relic temples, traverse the tea mountains on the vintage observation train, and track leopards in Yala.',
  description: [
    'If you have one long journey to give Sri Lanka, this is the one I would plan for you. Eleven unhurried days string together the ancient capitals of the Cultural Triangle, royal Kandy, the misty tea country around Nuwara Eliya and Ella, the leopard country of Yala and the Dutch ramparts of Galle.',
    'Every transfer is broken with something worth stopping for — a spice garden, a waterfall, a roadside king coconut — and the longer stays are placed where you will want to linger: three nights in the Cultural Triangle and two in Ella.',
  ].join('\n\n'),
  cardTag: 'Grand Circuit',
  durationDays: 11,
  durationNights: 10,
  route: ['Negombo', 'Cultural Triangle', 'Kandy', 'Ella Highlands', 'Yala National Park', 'Galle Fort'],
  highlights: ['Leopard Safari in Yala', 'First-Class Scenic Tea Train', 'Private Village Cooking Feast'],
  badges: ['Signature Circuit', 'Private Chauffeur-Guide', 'UNESCO World Heritage', 'Leopard Country'],
  overview: {
    kicker: 'The Complete Island',
    heading: 'Ancient Kingdoms, Tea Mountains, Wild Leopards & Ocean Ramparts',
    quote:
      'In eleven days the island changes its clothes five times — from dry-zone monoliths to cloud forest, from leopard scrub to the Indian Ocean. I want you to feel every one of those changes, slowly.',
  },
  keyFeatures: [
    {
      icon: 'account_balance',
      title: 'Three Ancient Capitals',
      text: 'Sigiriya at dawn, Polonnaruwa by bicycle and the sacred city of Kandy.',
    },
    {
      icon: 'train',
      title: 'The Scenic Blue Train',
      text: 'Reserved observation seats from Nanu Oya to Ella through the heart of tea country.',
    },
    {
      icon: 'pets',
      title: 'Yala Leopard Safari',
      text: 'Private 4x4 with a senior tracker, timed for the first and last light.',
    },
    {
      icon: 'person_pin',
      title: '100% Private Guide',
      text: 'One licensed National Lecturer and one vehicle for your party from arrival to farewell.',
    },
  ],
  included: [
    guideIncluded,
    vehicleIncluded,
    {
      icon: 'confirmation_number',
      text: 'Entrance permits for Sigiriya, Dambulla, Polonnaruwa, the Temple of the Tooth and Galle Fort sites',
    },
    { icon: 'pets', text: 'Private open 4x4 safari in Yala with park fees and a senior wildlife tracker' },
    trainIncluded,
    accommodation(10),
    refreshmentsIncluded,
  ],
  notIncluded: standardNotIncluded,
  routeSummary: '1,050 Kilometers · 5 Distinct Landscapes',
  travellerTypes: ['couple', 'family', 'group', 'solo'],
  seasons: ['nov-apr'],
  cover: 'tour-grand-ceylon-cover',
  gallery: [
    {
      image: 'hero-sigiriya-sunrise',
      title: 'Sigiriya at Sunrise',
      caption: 'Before the heat and the crowds',
    },
    { image: 'gallery-temple-tooth-lamps', title: 'Kandy by Lamplight', caption: 'The evening puja' },
    { image: 'gallery-nine-arches-clouds', title: 'The Blue Train', caption: 'Nanu Oya to Ella' },
    { image: 'dest-yala-leopard-trail', title: 'Yala Leopard', caption: 'Dawn safari with a senior tracker' },
    { image: 'dest-galle-lighthouse', title: 'Galle Fort', caption: 'A final sunset on the ramparts' },
  ],
  days: [
    {
      title: 'Arrival & a Lagoon-Side Welcome in Negombo',
      description:
        'I meet you at the arrivals hall with cold towels and king coconut water, and in twenty-five minutes you are at a quiet lagoon-side hotel. A gentle evening walk past the fishing boats and a welcome seafood dinner while I sketch the journey ahead.',
      drivingTime: 'Drive: ~25 mins',
      meals: 'Welcome Dinner',
      overnightArea: 'Negombo',
      details: [{ label: 'Curated Highlight', value: 'Sunset by the Negombo lagoon' }],
      stops: [P.airport, P.negombo],
    },
    {
      title: 'Into the Cultural Triangle via the Dambulla Cave Temples',
      description:
        'We drive inland to the dry zone, pausing for a roadside breakfast of hoppers, and spend the afternoon in the painted caves of Dambulla. Evening arrival at a forest lodge within sight of Sigiriya.',
      drivingTime: 'Drive: ~4 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Sigiriya',
      details: [{ label: 'Private Inclusion', value: 'Floral offerings prepared for the caves' }],
      stops: [P.negombo, P.dambulla, P.sigiriya],
    },
    {
      title: 'Sigiriya at Dawn & a Private Village Cooking Feast',
      description:
        'First entry to the Lion Rock while the air is cool, the frescoes quiet and mist still on the forest. After a rest, a village family welcomes us to cook a feast of clay-pot curries over wood fire — and to eat it together on banana leaves.',
      drivingTime: 'Full Day',
      meals: 'Breakfast, Village Lunch',
      overnightArea: 'Sigiriya',
      isHighlight: true,
      details: [
        { label: 'VIP Feature', value: 'Early gate entry to Sigiriya' },
        { label: 'Culinary', value: 'Private village cooking feast' },
      ],
      stops: [P.sigiriya, { name: 'Hiriwadunna Village', lat: 8.0233, lng: 80.7392 }],
    },
    {
      title: 'Polonnaruwa by Bicycle & the Minneriya Elephant Gathering',
      description:
        'Vintage bicycles through the royal palaces and rock-cut Buddhas of Polonnaruwa in the morning light. In the late afternoon, a private jeep safari in Minneriya, where elephants gather on the grasslands around the ancient reservoir.',
      drivingTime: 'Drive: ~1 hr each way',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Sigiriya',
      details: [{ label: 'Wildlife', value: 'Minneriya or Kaudulla, depending on the herds' }],
      stops: [P.polonnaruwa, P.minneriya],
    },
    {
      title: 'Matale Spice Gardens & the Evening Puja in Kandy',
      description:
        'We climb gently to Matale for true Ceylon cinnamon, cardamom and pepper in an ethical spice garden, then on to Kandy. At dusk, dressed in white, we join the drum-and-horn puja at the Temple of the Sacred Tooth Relic.',
      drivingTime: 'Drive: ~3 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Kandy',
      details: [{ label: 'Attire Prep', value: 'White wraps provided for the temple' }],
      stops: [P.sigiriya, P.matale, P.kandyTemple],
    },
    {
      title: 'Waterfalls & Tea Factories on the Road to Nuwara Eliya',
      description:
        'After the Peradeniya botanic gardens, the road climbs past Ramboda Falls into the tea. We stop at a working factory for a cupping session before arriving in “Little England” for high tea and a fireside dinner.',
      drivingTime: 'Drive: ~3 hrs',
      meals: 'Breakfast, High Tea, Dinner',
      overnightArea: 'Nuwara Eliya',
      details: [{ label: 'Masterclass', value: 'Tea cupping with a factory officer' }],
      stops: [P.peradeniya, { name: 'Ramboda Falls', lat: 7.0546, lng: 80.6977 }, P.nuwaraEliya],
    },
    {
      title: 'The Scenic Blue Train to Ella',
      description:
        'From Nanu Oya the observation carriage winds through tunnels, tea estates and cloud forest to Ella — the most beautiful railway journey on the island. Your luggage travels with the car, and we watch the train cross the Nine Arches Bridge at sunset.',
      drivingTime: 'Train: ~3.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Ella',
      details: [
        { label: 'Train', value: 'Reserved first-class observation seats' },
        { label: 'Luggage Care', value: 'Transported separately by car' },
      ],
      stops: [P.nanuOya, P.ella, P.nineArches],
    },
    {
      title: 'Little Adam’s Peak at Dawn & a Planter’s Tea Tasting',
      description:
        'A lantern-lit climb to Little Adam’s Peak for sunrise over the Ella Gap, breakfast back at the villa, and an afternoon tasting of rare golden tips in a planter’s bungalow. The rest of the day is yours.',
      drivingTime: 'Highland Leisure',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Ella',
      details: [{ label: 'Curated Highlight', value: 'Sunrise from the eastern rock bench' }],
      stops: [P.littleAdams, P.ella],
    },
    {
      title: 'Down the Ella Gap to Yala & a Dusk Safari',
      description:
        'We descend past Ravana Falls to the dry south-east and check into a tented camp on the edge of Yala. In the afternoon, our first private safari with a senior tracker as the leopards begin to move.',
      drivingTime: 'Drive: ~2.5 hrs',
      meals: 'Breakfast, Lunch, Dinner',
      overnightArea: 'Yala',
      details: [{ label: 'Overnight Residence', value: 'Luxury tented camp near Palatupana' }],
      stops: [P.ella, P.ravanaFalls, P.yala],
    },
    {
      title: 'Dawn Leopard Drive & the Coast Road to Galle Fort',
      description:
        'A full dawn drive in Yala with breakfast in the park, then west along the coast past stilt fishermen to Galle Fort. Sunset walk on the ramparts with a sundowner on Flag Rock.',
      drivingTime: 'Drive: ~3.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Galle Fort',
      details: [{ label: 'Sunset Highlight', value: 'Rampart walk ending at Flag Rock Bastion' }],
      stops: [P.yala, P.weligama, P.galleFort],
    },
    {
      title: 'Galle Fort Morning & Airport Farewell',
      description:
        'A last slow breakfast and a stroll through the fort’s lanes before the expressway takes us back to the airport in about two and a half hours. A day room can be arranged for late flights.',
      drivingTime: 'Drive: ~2.5 hrs via Highway',
      meals: 'Breakfast',
      overnightArea: 'Departure',
      details: [{ label: 'Farewell', value: 'Ceylon tea gift from Dinesh' }],
      stops: [P.galleFort, P.airport],
    },
  ],
  categories: ['cultural-heritage', 'wildlife-safari', 'pristine-beaches', 'hill-country'],
  destinations: [
    'sigiriya-dambulla',
    'anuradhapura-polonnaruwa',
    'kandy-knuckles',
    'nuwara-eliya',
    'ella',
    'yala-bundala',
    'galle-fort',
  ],
}
