/**
 * The Cultural Odyssey — complete content from the client's tour-detail design screen.
 *
 * PLACEHOLDER SAMPLE CONTENT (client's Stitch design copy) — to be reviewed/replaced by the client.
 */
import type { SeedTour } from '../types'
import { P, refreshmentsIncluded, standardNotIncluded, trainIncluded, vehicleIncluded } from './common'

export const culturalOdyssey: SeedTour = {
  slug: 'cultural-odyssey',
  isMostPopular: true,
  title: 'The Cultural Odyssey',
  summary:
    'Our flagship private journey through Ceylon’s gilded kingdoms: a dawn ascent of Sigiriya before the crowds, the sacred Temple of the Tooth, the scenic tea-country train to Nuwara Eliya and sunset on the ramparts of Galle Fort.',
  description: [
    'Designed for travelers who demand both historical rigor and uncompromised ease, **The Cultural Odyssey** is our flagship private journey. Rather than racing through crowded coach routes, this expedition unfolds at an unhurried, private tempo.',
    'You will bypass queues with privileged access, converse directly with temple curators, savor plantation high teas in colonial salons, and wind through emerald hill passes in a climate-controlled executive vehicle reserved solely for your party.',
  ].join('\n\n'),
  cardTag: 'Chauffeur Guide',
  durationDays: 9,
  durationNights: 8,
  route: ['Colombo', 'Sigiriya & Dambulla', 'Polonnaruwa', 'Kandy', 'Nuwara Eliya', 'Galle Fort'],
  highlights: [
    'Sigiriya Private Dawn Climb',
    'Sacred Tooth Relic VIP Entry',
    'Bespoke Village Cooking Feast',
  ],
  badges: ['UNESCO World Heritage', 'Private Chauffeur-Guide', 'VIP Access', 'Bespoke Blueprint'],
  overview: {
    kicker: 'The Expedition Philosophy',
    heading: 'A Privileged Traverse Through Ceylon’s Gilded Kingdoms',
    quote:
      'Sri Lanka is not merely seen; it is decoded. When the dawn light strikes the fifth-century frescoes of Sigiriya before the valley awakes, or when the deep resonant rhythm of temple drums reverberates across the sacred precincts of Kandy, one steps into a living continuity of twenty-five centuries.',
  },
  keyFeatures: [
    {
      icon: 'account_balance',
      title: '5 Monastic Citadels',
      text: 'Curated VIP admission to Sigiriya, Polonnaruwa, Dambulla, Kandy & Galle Fort.',
    },
    {
      icon: 'person_pin',
      title: '100% Private Guide',
      text: 'Your personal licensed National Lecturer stays exclusively with your party.',
    },
    {
      icon: 'directions_car',
      title: 'VIP Executive Fleet',
      text: 'Air-conditioned luxury cruiser with Wi-Fi, chilled Ceylon spring water & cool towels.',
    },
    {
      icon: 'nest_clock_farsight_analog',
      title: 'Fluid Private Pacing',
      text: 'Wake when you wish, stop for roadside king coconuts, and explore without haste.',
    },
  ],
  included: [
    {
      icon: 'verified',
      text: 'Dedicated licensed National Tourist Guide Lecturer (Dinesh Jayasuriya or vetted senior scholar) throughout the journey',
    },
    vehicleIncluded,
    {
      icon: 'confirmation_number',
      text: 'All VIP UNESCO entrance permits and site admissions (Sigiriya, Polonnaruwa, Dambulla, Kandy, Galle Fort)',
    },
    trainIncluded,
    {
      icon: 'hotel',
      text: '8 nights handpicked boutique luxury accommodations with daily breakfasts and curated dinners',
    },
    refreshmentsIncluded,
  ],
  notIncluded: standardNotIncluded,
  terrains: [
    {
      label: 'Cultural Dry Plains',
      place: 'Sigiriya & Dambulla',
      note: 'Elevation: 190m · Warm dry breeze, starry night skies, dramatic rocky monoliths.',
    },
    {
      label: 'Central Tea Cloudforest',
      place: 'Nuwara Eliya Hills',
      note: 'Elevation: 1,868m · Crisp alpine air (14°C - 20°C), rolling mist, verdant slopes.',
    },
    {
      label: 'Southern Tropical Ocean',
      place: 'Galle Coastline',
      note: 'Elevation: Sea Level · Balmy sea breezes, turquoise swell, vibrant Dutch ramparts.',
    },
  ],
  routeSummary: '745 Kilometers · 3 Distinct Climate Zones',
  travellerTypes: ['couple', 'family', 'solo', 'group'],
  seasons: ['nov-apr', 'jul-aug'],
  cover: 'tour-cultural-odyssey-cover',
  gallery: [
    {
      image: 'tour-cultural-odyssey-sigiriya-dawn',
      title: 'Dawn over the Lion Citadel of Sigiriya',
      caption: 'Day 03 Milestone',
    },
    {
      image: 'tour-cultural-odyssey-kandy-relic',
      title: 'Sacred Kandy Relic',
      caption: 'Evening puja at the Temple of the Tooth',
    },
    {
      image: 'tour-cultural-odyssey-gal-vihara',
      title: 'Polonnaruwa Carvings',
      caption: 'The rock-cut Buddhas of Gal Vihara',
    },
    {
      image: 'tour-cultural-odyssey-hearth-cooking',
      title: 'Heirloom Flavors',
      caption: 'Farm lunch cooked in earthenware',
    },
    {
      image: 'tour-cultural-odyssey-galle-ramparts',
      title: 'Galle Fort Ramparts',
      caption: 'Sundowner on Flag Rock Bastion',
    },
    {
      image: 'gallery-kandalama-water-lilies',
      title: 'Kandalama Reservoir',
      caption: 'Evening walk among aquatic birds',
    },
    {
      image: 'gallery-matale-spice-grove-feast',
      title: 'Spices of Matale',
      caption: 'True Ceylon cinnamon and cardamom',
    },
    {
      image: 'gallery-tea-pluckers-pedro',
      title: 'Two Leaves and a Bud',
      caption: 'Single-estate tea plucking',
    },
    {
      image: 'gallery-stilt-fishermen-dusk',
      title: 'Stilt Fishermen of Weligama',
      caption: 'Dawn on the southern coast',
    },
  ],
  days: [
    {
      title: 'Arrival at Bandaranaike & Coastal Welcome to Negombo',
      description:
        'Touch down at Bandaranaike International Airport where your licensed National Guide Lecturer and private chauffeur welcome you past customs with fragrant cold towels and chilled Ceylon king coconut water. Transfer effortlessly to your serene colonial beachfront sanctuary in Negombo. Savor an intimate welcome seafood dinner overlooking the Indian Ocean as Dinesh introduces the cultural tapestry ahead.',
      drivingTime: 'Drive: ~25 mins',
      meals: 'Welcome Dinner',
      overnightArea: 'Negombo Sanctuary',
      details: [
        { label: 'Overnight Residence', value: 'The Wallawwa / Heritance Negombo' },
        { label: 'Curated Highlight', value: 'Private sunset briefing on Ceylon history' },
        { label: 'Bespoke Option', value: 'Ayurvedic jet-lag revive massage' },
      ],
      stops: [P.airport, P.negombo],
    },
    {
      title: 'Ancient Cave Temples of Dambulla & The Golden Triangle',
      description:
        'Journey inland into the dry-zone cultural heartland. In the afternoon, ascend the gentle granite steps to the UNESCO-listed Dambulla Golden Rock Cave Temples. Spanning five immense cavern sanctuaries adorned with over 150 serene statues and vibrant 2,000-year-old Buddhist ceiling murals, Dinesh interprets the iconography away from regular tourist traffic. Conclude the day with an evening walk along the peaceful banks of Kandalama reservoir watching aquatic birds and wild water buffalo.',
      drivingTime: 'Drive: ~3.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Sigiriya Pavilions',
      details: [
        { label: 'Overnight Residence', value: 'Sigiriya Forest Pavilions (or Heritance Kandalama)' },
        { label: 'Curated Highlight', value: 'Cave 2 Maharaja Lena VIP access' },
        { label: 'Private Inclusion', value: 'Pre-arranged floral offerings for caves' },
      ],
      stops: [P.negombo, P.dambulla, P.kandalama],
    },
    {
      title: 'Dawn Ascent of Sigiriya Lion Rock & Polonnaruwa Ruins',
      description: [
        'Set out at 06:30 AM to beat the mid-morning heat and coach groups. Ascend King Kashyapa’s 5th-century sheer granite citadel, pausing midway at the sheer mirror wall and celestial cloud maiden frescoes. Stand atop the 200-meter sky palace summit for panoramic 360-degree views of mist parting over endless virgin jungle.',
        'Refresh with freshly cut Thambili (king coconuts) at the base before an exclusive private lunch cooked in earthenware by a local heirloom farmer. In the afternoon, glide via private golf buggy or vintage Dutch bicycle through the royal palaces and stone-carved colossal Buddhas of medieval Polonnaruwa.',
      ].join('\n\n'),
      drivingTime: 'Full Day',
      meals: 'Breakfast, Farm Lunch',
      overnightArea: 'Sigiriya Pavilions',
      isHighlight: true,
      details: [
        { label: 'Overnight Residence', value: 'Sigiriya Forest Pavilions' },
        { label: 'VIP Feature', value: 'Early gate opening permits' },
        { label: 'Culinary', value: 'Traditional banana leaf organic lunch' },
      ],
      stops: [P.sigiriya, P.polonnaruwa],
    },
    {
      title: 'Spices of Matale & Arrival in the Royal Hill Capital of Kandy',
      description:
        'Ascend from the dry plains into the cooler intermediate slopes of Matale. Visit an ethical spice garden with Dinesh to touch and smell true Ceylon cinnamon (Cinnamomum verum), wild green cardamom, and fresh peppercorns. Continue into royal Kandy, the last bastion of Sinhalese monarchs. At twilight, enjoy pre-arranged VIP seating for the mesmerizing drum-and-horn evening Puja ceremony inside Sri Dalada Maligawa (Temple of the Sacred Tooth Relic).',
      drivingTime: 'Drive: ~2.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Kandy Hills Manor',
      details: [
        { label: 'Overnight Residence', value: 'Elephant Stables / Kandy House' },
        { label: 'Curated Highlight', value: 'Private escort through Temple Inner Sanctum' },
        { label: 'Attire Prep', value: 'White silk wraps provided for respectful entry' },
      ],
      stops: [P.sigiriya, P.matale, P.kandyTemple],
    },
    {
      title: 'Royal Botanical Gardens & The Scenic Highland Train',
      description:
        'Begin the morning walking through the world-renowned Peradeniya Royal Botanical Gardens, flanked by century-old giant Java fig trees and thousands of orchid varieties. Afterward, board the legendary blue train with guaranteed 1st-class observation seats. Watch waterfalls plunge down misty ravines as the train winds upward through emerald sea carpets of tea into "Little England" — Nuwara Eliya (elevation 1,868m).',
      drivingTime: 'Train: ~3.5 hrs',
      meals: 'Breakfast, High Tea, Dinner',
      overnightArea: 'Nuwara Eliya Estate',
      details: [
        { label: 'Overnight Residence', value: 'Grand Hotel / Ceylon Tea Trails' },
        { label: 'Luggage Care', value: 'Luggage transported separately via private car' },
        { label: 'Traditional Tea', value: 'Afternoon High Tea in manicured rose gardens' },
      ],
      stops: [P.peradeniya, P.nanuOya, P.nuwaraEliya],
    },
    {
      title: 'Single-Estate Ceylon Tea Plucking & Highland Waterfalls',
      description:
        'Don traditional bamboo tea baskets and join expert female plucking masters on the misty highland slopes. Learn the sacred "two leaves and a bud" criteria before heading inside an operating single-estate factory with the resident tea planter. Conclude with a cupping session differentiating Silver Tips, Orange Pekoe, and Broken Orange Pekoe. Spend the afternoon leisurely strolling the Tudor-style cottages and Gregory Lake.',
      drivingTime: 'Highland Leisure',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Nuwara Eliya Estate',
      details: [
        { label: 'Overnight Residence', value: 'Nuwara Eliya Colonial Estate' },
        { label: 'Masterclass', value: 'Sensory cupping with master tea maker' },
        { label: 'Estate Gift', value: 'Personalized canister of single-harvest tea' },
      ],
      stops: [P.pedro, P.gregoryLake],
    },
    {
      title: 'Descent to the Southern Ocean & UNESCO Galle Fort',
      description:
        'Descend dramatically from cool cloud forests down through the cascading Ravana Falls to the balmy southern coastline of the Indian Ocean. Check into your restored 18th-century merchant villa inside the living fortress of Galle. As the golden hour approaches, Dinesh guides you along the massive coral-stone bastions, historic clock tower, and Portuguese-Dutch ramparts while local families fly kites into the salty ocean breeze.',
      drivingTime: 'Drive: ~4.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Galle Fort Villa',
      details: [
        { label: 'Overnight Residence', value: 'Fort Bazaar / Amangalla / Galle Fort Hotel' },
        { label: 'Sunset Highlight', value: 'Sundowner atop Flag Rock Bastion' },
        { label: 'Atmosphere', value: 'Ambient jazz and boutique artisan alleyways' },
      ],
      stops: [P.nuwaraEliya, P.ravanaFalls, P.galleFort],
    },
    {
      title: 'Stilt Fishermen of Weligama, Cinnamon Islands & Coastal Relaxation',
      description:
        'Greet the dawn watching traditional stilt fishermen perched delicately on crossbars over breaking waves at Weligama. Later, cruise quietly on a private wooden boat through the mangrove labyrinths of the Madu Ganga estuary to a secluded island dedicated solely to peeling Ceylon cinnamon. Spend your final afternoon lounging by the private pool or browsing high-end sapphire gem studios and antique shops.',
      drivingTime: 'Coastal Exploration',
      meals: 'Breakfast',
      overnightArea: 'Galle Fort Villa',
      details: [
        { label: 'Overnight Residence', value: 'Galle Fort Heritage Villa' },
        { label: 'Private Boat', value: 'Shaded wooden canopy boat with refreshments' },
        { label: 'Evening Option', value: 'Celebratory beachfront tasting dinner' },
      ],
      stops: [P.weligama, P.maduGanga, P.galleFort],
    },
    {
      title: 'Colombo Heritage Architecture & Airport Farewell',
      description:
        'Following a lazy colonial breakfast on the verandah, take the scenic Southern Expressway back toward Colombo. Enjoy an exclusive architectural drive visiting master tropical modernist Geoffrey Bawa’s historic townhouse (Number 11) and the iconic Parliament at Sri Jayawardenepura Kotte. Make a curated stop for pure handloom textiles and spices before your private chauffeur-guide delivers you smoothly to Bandaranaike Airport for your evening flight homeward.',
      drivingTime: 'Drive: ~2 hrs via Highway',
      meals: 'Breakfast',
      overnightArea: 'Departure',
      details: [
        { label: 'Airport Departure', value: 'Seamless curbside drop-off' },
        { label: 'Late Check-Out', value: 'Pre-arranged day room available on request' },
        { label: 'Farewell', value: 'Traditional Ceylon gift hamper from Dinesh' },
      ],
      stops: [
        P.galleFort,
        { name: 'Number 11 (Geoffrey Bawa House)', lat: 6.8968, lng: 79.8535 },
        { name: 'Parliament of Sri Lanka, Kotte', lat: 6.8868, lng: 79.9187 },
        P.airport,
      ],
    },
  ],
  categories: ['cultural-heritage', 'hill-country'],
  destinations: [
    'colombo',
    'sigiriya-dambulla',
    'anuradhapura-polonnaruwa',
    'kandy-knuckles',
    'nuwara-eliya',
    'galle-fort',
    'mirissa-weligama',
  ],
  seoTitle: 'The Cultural Odyssey · 9-Day Private Sri Lanka Tour',
  seoDescription:
    'A private 8-night journey from Sigiriya at dawn to the Temple of the Tooth, the tea-country train and Galle Fort — guided personally by Dinesh Jayasuriya.',
}
