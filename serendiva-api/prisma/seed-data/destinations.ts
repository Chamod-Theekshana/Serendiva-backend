/**
 * Destinations — the eight cards of the destinations explorer (Ella with the complete detail page from
 * the Ella design screen) plus four extra hubs used by the tours (Anuradhapura & Polonnaruwa, Udawalawe,
 * Colombo, Bentota) so that every region has destinations.
 *
 * PLACEHOLDER SAMPLE CONTENT: Ella and the card texts come from the client's Stitch design; everything
 * else is realistic sample copy written for the seed. To be reviewed/replaced by the client.
 * The array order is the display order (Destination.order).
 */
import type { SeedDestination } from './types'

const ella: SeedDestination = {
  slug: 'ella',
  region: 'hill-country',
  name: 'Ella',
  headline: 'Ella: Mist-Veiled Peaks, Ravana Legends & Highland Tea Heritage',
  tagline: 'Mist-Veiled Peaks, Ravana Legends & Highland Tea Estates',
  summary:
    'Perched on the southern rim of the Central Massif, Ella captivates with dramatic mountain vistas, historic stone viaducts, and crisp mountain air perfumed with freshly withered tea leaf notes.',
  description: [
    'Where the dramatic Southern Ridge drops 1,000 meters into sunlit lowlands—a sanctuary of cool alpine breezes, terraced Ceylon tea estates, and timeless stone railway marvels curated beyond the tourist trail.',
    'I time every Ella experience around the light: lantern-lit dawn climbs before the mist lifts, the blue train watched from a planter’s veranda rather than a crowded embankment, and long afternoons in a cliffside villa while the valley turns gold.',
  ].join('\n\n'),
  metaLabel: 'Central Hill Country · 1,041m',
  badge: 'Trekker & Tea Sanctuary',
  bestTimeLabel: 'Dec – Apr & Jul – Aug',
  curations: [
    'Dawn trek to Little Adam’s Peak before mist lifts',
    'Nine Arches Viaduct blue train private viewing pass',
    'Single-estate artisanal tea tasting with master planter',
  ],
  quickFacts: [
    {
      icon: 'sunny',
      label: 'Best Climate Window',
      value: 'Dec – Apr & Jul – Aug',
      note: 'Crisp mountain clarity, mild breezes & vibrant sunrise horizons',
    },
    {
      icon: 'bedtime',
      label: 'Serendiva Suggested Stay',
      value: '2 to 3 Unhurried Nights',
      note: 'Allows dawns at ridge crests, artisanal tastings & private rail passage',
    },
    {
      icon: 'thermostat',
      label: 'Elevation & Temperatures',
      value: '1,041 m • 18°C – 25°C',
      note: 'Pleasant temperate sun with evening alpine drops to 16°C',
    },
    {
      icon: 'train',
      label: 'Private Access Route',
      value: '3.5 hrs Scenic Rail',
      note: 'Or 4 hrs private luxury chauffeur carriage from Colombo / Galle Fort',
    },
  ],
  guideNote: {
    heading: 'Why Visit Ella Exclusively with a Private Host',
    paragraphs: [
      'Ella has gained worldwide acclaim for its dramatic gorge and misty stone viaducts, but standard tourist routes now run the risk of congested platform views and generic itineraries. For our private travelers, Serendiva opens doors that remain firmly closed to group operators.',
      'We take you onto secluded private planter paths that bypass the congested crowds entirely. When we ascend Little Adam’s Peak, we set out at 05:40 AM with lantern light, arriving at the private eastern rock bench just as the mist parts over the Wellawaya plains. When we visit the Nine Arches Viaduct, our guests observe the passing blue locomotive from a preserved colonial tea veranda with hot silver needle tea in hand, followed by an intimate walk down the sleepers accompanied by a retired third-generation Ceylon railway inspector.',
    ],
    perks: [
      { icon: 'hotel_class', label: 'Exclusive Planter Estate Permissions' },
      { icon: 'alarm_on', label: 'Off-Peak Dawn & Twilight Access' },
      { icon: 'directions_subway', label: 'Observation Carriage Handled Direct' },
    ],
  },
  experiences: [
    {
      kicker: '01 • Dawn Awakening',
      meta: 'Moderate • 1.5 Hours • 05:40 AM Departure',
      title: 'Dawn Sunrise Ascent of Little Adam’s Peak & Ella Gap',
      text: 'A gentle early climb winding through dew-kissed Camellia Sinensis tea bushes. You reach the panoramic eastern spine before the valley stirs, greeting the sunrise as the Ella Gorge opens southwards toward the distant Yala plains and Indian Ocean coast.',
      tagIcon: 'spa',
      tagLabel: 'Private Estate Ridge Trail',
      image: 'dest-ella-little-adams-peak',
    },
    {
      kicker: '02 • Colonial Engineering',
      meta: 'Leisurely • 2.5 Hours • Historic Archive Access',
      title: 'The Nine Arches Viaduct & Historic Demodara Loop',
      text: 'Avoid the muddy public pathways. We escort you through an exclusive private tea terrace with prime vantage points over the 1921 stone viaduct. Witness the blue train crossing without crowd obstructions, followed by boarding your private reserved first-class cabin to experience the unique spiral railway loop at Demodara.',
      tagIcon: 'train',
      tagLabel: '1st Class Observation Seats Secured',
      image: 'dest-ella-nine-arches-train',
    },
    {
      kicker: '03 • Artisanal Heritage',
      meta: 'Exclusive Access • 2 Hours • Superintendent Masterclass',
      title: 'Private Tea Planter’s Bungalow & Artisanal Tasting',
      text: 'Step inside an operating orthodox colonial estate closed to the general public. Walk the field contours with the estate manager to understand microclimatic terroir, followed by a formal cupping session of rare Hand-Rolled Golden Tips and White Pekoe in the planter’s private drawing room.',
      tagIcon: 'local_cafe',
      tagLabel: 'Rare Single-Estate Micro-Batches',
      image: 'dest-ella-tea-factory-tasting',
    },
    {
      kicker: 'Mythology & Solitude',
      title: 'Hidden Ravana Cave & Cascade Sanctuary',
      text: 'Explore the ancient limestone caverns connected to the Epic of Ramayana, then cool off in private natural rock pools deep in the forest away from highway viewpoints.',
      tagIcon: 'directions_car',
      tagLabel: 'Private Chauffeur transfer',
      image: 'dest-ella-river-pool',
    },
    {
      kicker: 'High Alpine Expedition',
      title: 'Horton Plains & World’s End Day Traverse',
      text: 'A bespoke dawn extension into the cloud forests of Horton Plains National Park. Trek to the 870-meter World’s End precipice and Baker’s Falls with our naturalist guide.',
      tagIcon: 'directions_car',
      tagLabel: '4x4 Private Chauffeur',
      image: 'dest-ella-worlds-end-hikers',
    },
  ],
  cuisine: {
    heading: 'Plantation Dining & Hill Country Culinary Nuances',
    intro:
      'Highland cuisine in Ella is distinct from the coastal lowlands—anchored by highland spices, organic vegetables harvested from volcanic mountain loam, and centuries of British colonial afternoon tea traditions.',
    items: [
      {
        icon: 'bakery_dining',
        title: 'Cardamom Tea Scones',
        text: 'Fresh warm plantation scones infused with crushed mountain cardamom pods, paired with fresh passion fruit curd and homemade strawberry preserves.',
      },
      {
        icon: 'soup_kitchen',
        title: 'Claypot Village Curries',
        text: 'Slow-simmered tender jackfruit (polos), tempered banana blossom, spicy wild chili pol sambol, and nutty heritage red rice cooked over woodfire embers.',
      },
      {
        icon: 'wine_bar',
        title: 'Veranda Candlelight',
        text: 'Four-course bespoke planter dinners served on open colonial verandas as the mountain mist rolls in, warmed by brass fire braziers and fine vintage wine.',
      },
    ],
  },
  stays: [
    {
      icon: 'star',
      category: 'Heritage Category',
      title: 'Restored Colonial Tea Planter Bungalows',
      text: 'Centuries-old stone estate residences set deep within private working plantations. Featuring roaring open fireplaces, clawfoot copper soaker tubs, bespoke butler service, and manicured croquet lawns overlooking the mist-filled valley.',
      features: ['Private Butler', 'Fireplace Suites', 'Working Estate'],
      image: 'dest-ella-stay-planter-bungalow',
    },
    {
      icon: 'landscape',
      category: 'Architectural Sanctuary',
      title: 'Eco-Luxury Cliffside Mountain Hideaways',
      text: 'Minimalist timber and glass pavilions cantilevered along the ridge line. Wake up to panoramic floor-to-ceiling vistas directly facing the 1,000-meter drop of Ella Gap, with private plunge pools heated by highland solar arrays.',
      features: ['Ella Gap Panoramic View', 'Infinity Plunge Pool', 'Absolute Seclusion'],
      image: 'dest-ella-stay-cliffside-villa',
    },
    {
      icon: 'nature_people',
      category: 'Valley Retreat',
      title: 'Secluded Boutique Villas in Demodara Valley',
      text: 'Tucked away 15 minutes north of the central hub, these intimate private villas sit amidst organic cinnamon and clove gardens. An ideal retreat for writers, couples, and multi-generational families desiring complete immersion in rural birdsong.',
      features: ['Spice Garden Setting', 'Private Resident Chef', 'Total Serenity'],
      image: 'dest-ella-stay-demodara-villa',
    },
  ],
  fieldNotes: [
    {
      icon: 'ac_unit',
      title: 'Evening Alpine Chill',
      text: 'Bring a fine cashmere layer or light woolen wrap for dusk. While daytime reaches a warm 25°C, valley winds drop evening temperatures swiftly to 16°C.',
    },
    {
      icon: 'confirmation_number',
      title: '1st Class Train Reality',
      text: 'Government observation car tickets open precisely 30 days prior and vanish within minutes. As a Serendiva guest, I secure these physical allocations directly through station contacts.',
    },
    {
      icon: 'wb_twilight',
      title: 'Golden Hour Timing',
      text: 'The finest photographic light on Ella Rock strikes between 06:15 AM and 07:00 AM. After 09:30 AM, thermal heat clouds often begin hugging the eastern rock faces.',
    },
  ],
  interests: ['1st Class Train', 'Tea Plantations', 'Mountain Treks', 'Relaxation & Spas', 'Ramayana Lore'],
  mapPoints: [
    { name: 'Nine Arches Viaduct', lat: 6.8768, lng: 81.0608 },
    { name: "Little Adam's Peak", lat: 6.8689, lng: 81.0628 },
    { name: 'Ella Rock Summit', lat: 6.8573, lng: 81.0381 },
    { name: 'Ravana Sanctuary', lat: 6.8406, lng: 81.0544 },
    { name: 'Demodara Spiral Loop', lat: 6.9003, lng: 81.064 },
  ],
  latitude: 6.8667,
  longitude: 81.0466,
  elevation: 1041,
  cover: 'dest-ella-hero-gap',
  gallery: [
    { image: 'dest-ella-rock', title: 'Ella Rock', caption: 'Cloud precipice' },
    { image: 'dest-ella-nine-arches', title: 'Nine Arches', caption: 'Colonial viaduct' },
    { image: 'dest-ella-tea-plucker', title: 'Orthodox Tea', caption: 'Private estate walk' },
    { image: 'dest-ella-ravana-falls', title: 'Ravana Falls', caption: 'Hidden rock cascades' },
    { image: 'dest-ella-card', title: 'Ella Rock Tea Slopes', caption: 'Morning mist over the estates' },
    { image: 'dest-ella-gap-viewpoint', title: 'The Ella Gap', caption: 'A 1,000-metre drop to the plains' },
  ],
  seoTitle: 'Ella, Sri Lanka · Private Guide to Tea Country & Peaks',
  seoDescription:
    'Discover Ella privately with licensed guide Dinesh Jayasuriya: dawn on Little Adam’s Peak, the Nine Arches Bridge without crowds, and planter-bungalow tea tastings.',
}

const sigiriya: SeedDestination = {
  slug: 'sigiriya-dambulla',
  region: 'cultural-triangle',
  name: 'Sigiriya & Dambulla',
  headline: 'Sigiriya & Dambulla: Sky Citadels, Water Gardens & Gilded Cave Sanctuaries',
  tagline: '5th-Century Sky Citadels & Gilded Cave Sanctuaries',
  summary:
    'Ascend King Kashyapa’s monolith citadel and explore five sacred cliffside chambers filled with 150+ gilded Buddha statues.',
  description: [
    'At the heart of the Cultural Triangle, a 200-metre granite monolith rises out of the dry-zone forest, crowned by the ruins of King Kashyapa’s fifth-century sky palace. Below it lie symmetrical water gardens, mirror walls and the celebrated cloud-maiden frescoes.',
    'Twenty kilometres away, the Dambulla cave temples hold more than two thousand years of devotion in five painted chambers. I pair both with quiet evenings at Kandalama reservoir and village kitchens where lunch is still cooked in clay over wood embers.',
  ].join('\n\n'),
  metaLabel: 'Cultural Triangle · UNESCO',
  bestTimeLabel: 'Nov – Apr',
  curations: [
    'Dawn VIP gate ascent prior to general opening',
    'Private royal water garden champagne picnic',
    'Dambulla cave fresco analysis with heritage lecturer',
  ],
  quickFacts: [
    {
      icon: 'sunny',
      label: 'Best Climate Window',
      value: 'Nov – Apr',
      note: 'Dry, bright mornings once the late-year showers ease',
    },
    {
      icon: 'bedtime',
      label: 'Suggested Stay',
      value: '2 to 3 Nights',
      note: 'A dawn climb, the Dambulla caves and a Polonnaruwa day',
    },
    {
      icon: 'thermostat',
      label: 'Elevation & Temperatures',
      value: '190 m • 24°C – 33°C',
      note: 'Warm dry-zone air — the 1,200 steps are kindest before 08:00',
    },
    {
      icon: 'directions_car',
      label: 'Private Access Route',
      value: '4 hrs from Colombo',
      note: 'Or 2.5 hrs from Kandy via the Matale spice gardens',
    },
  ],
  guideNote: {
    heading: 'Why I Climb Sigiriya Before the Gates Fill',
    paragraphs: [
      'By 10:30 the black granite stairs radiate heat and the mirror wall gallery moves at the pace of the coach groups. I arrange the first permitted entry so that you climb in cool shade, pause at the frescoes in silence and reach the summit while mist still drifts over the forest canopy.',
    ],
    perks: [
      { icon: 'alarm_on', label: 'Early Gate Permits' },
      { icon: 'temple_buddhist', label: 'Cave Temple Interpretation' },
      { icon: 'water_drop', label: 'Chilled King Coconuts at the Base' },
    ],
  },
  experiences: [
    {
      kicker: '01 • Dawn Ascent',
      meta: 'Moderate • 3 Hours • First Gate Entry',
      title: 'Private Dawn Ascent of the Lion Rock',
      text: 'We walk through the water gardens as the light turns gold, pause at the cloud-maiden frescoes before the crowds arrive and stand on the summit palace with the whole Cultural Triangle at our feet.',
      tagIcon: 'alarm_on',
      tagLabel: 'Early Gate Permits',
      image: 'tour-cultural-odyssey-sigiriya-dawn',
    },
    {
      kicker: '02 • Sacred Art',
      meta: 'Gentle • 2 Hours • Afternoon Light',
      title: 'Dambulla Golden Rock Cave Temples',
      text: 'Five cavern sanctuaries, more than 150 statues and ceiling murals painted over two millennia. I interpret the iconography cave by cave, with floral offerings prepared for you at the entrance.',
      tagIcon: 'temple_buddhist',
      tagLabel: 'Heritage Lecturer Interpretation',
    },
    {
      kicker: '03 • Ancient Engineering',
      meta: 'Leisurely • 1.5 Hours • Golden Hour',
      title: 'Water Lilies of Kandalama & the Royal Tanks',
      text: 'A quiet pontoon crossing on an ancient reservoir as storks and sea eagles settle into the forest rim — and the story of the hydraulic engineering that fed these kingdoms.',
      tagIcon: 'sailing',
      tagLabel: 'Private Pontoon Crossing',
      image: 'gallery-kandalama-water-lilies',
    },
  ],
  fieldNotes: [
    {
      icon: 'wb_twilight',
      title: 'Beat the Heat',
      text: 'Start the climb at gate opening. By mid-morning the granite stairs are hot and the queues on the spiral staircase lengthen quickly.',
    },
    {
      icon: 'checkroom',
      title: 'Cave Temple Etiquette',
      text: 'Shoulders and knees covered, shoes and hats off at the threshold. I keep light wraps in the vehicle for every guest.',
    },
    {
      icon: 'warning',
      title: 'Quiet on the Western Face',
      text: 'Wild hornets nest near the Lion Paws terrace. Keep voices low there — I watch the signals and choose our timing accordingly.',
    },
  ],
  interests: [
    'Sigiriya Dawn Climb',
    'Dambulla Cave Temples',
    'Pidurangala Sunrise',
    'Village Cooking',
    'Hot-Air Balloon',
  ],
  mapPoints: [
    { name: 'Sigiriya Lion Rock', lat: 7.957, lng: 80.7603 },
    { name: 'Royal Water Gardens', lat: 7.9563, lng: 80.7552 },
    { name: 'Pidurangala Rock', lat: 7.9665, lng: 80.7598 },
    { name: 'Dambulla Cave Temple', lat: 7.8567, lng: 80.6492 },
    { name: 'Kandalama Reservoir', lat: 7.8733, lng: 80.7036 },
  ],
  latitude: 7.957,
  longitude: 80.7603,
  elevation: 190,
  cover: 'dest-sigiriya-card',
  gallery: [
    { image: 'dest-sigiriya-aerial-moat', title: 'The Royal Moat', caption: 'Water gardens seen from above' },
    { image: 'blog-pidurangala-view', title: 'From Pidurangala', caption: 'The Lion Rock at first light' },
    {
      image: 'gallery-kandalama-water-lilies',
      title: 'Kandalama Wewa',
      caption: 'Ancient irrigation at sunset',
    },
  ],
}

const galle: SeedDestination = {
  slug: 'galle-fort',
  region: 'south-coast',
  name: 'Galle Fort',
  headline: 'Galle Fort: Dutch Ramparts, Spice Mansions & Bastion Sunsets',
  tagline: '17th-Century Dutch Ramparts, Bastions & Spice Mansions',
  summary:
    'Living UNESCO fortress where colonial Dutch architecture merges with bespoke gemstone ateliers, private villas, and bastion sunset vistas.',
  description: [
    'Built by the Portuguese and fortified by the Dutch East India Company, Galle Fort is still a living town: families fly kites from the coral-stone bastions, church bells ring over quiet lanes and merchant mansions have become small galleries and courtyard cafés.',
    'I walk the ramparts with you at golden hour, open doors to hidden Dutch courtyards and stay in restored villas inside the walls so that the fort is yours again once the day visitors leave.',
  ].join('\n\n'),
  metaLabel: 'Southern Coast · UNESCO',
  bestTimeLabel: 'Nov – Apr',
  curations: [
    'Flag Rock Bastion sunset walk with local historian',
    'Exclusive Ceylon sapphire atelier private viewing',
    'Private architectural tour of hidden Dutch courtyards',
  ],
  quickFacts: [
    {
      icon: 'sunny',
      label: 'Best Climate Window',
      value: 'Nov – Apr',
      note: 'Calm seas, clear sunsets and gentle trade winds',
    },
    {
      icon: 'bedtime',
      label: 'Suggested Stay',
      value: '2 Nights',
      note: 'One sunset on Flag Rock, one slow morning in the lanes',
    },
    {
      icon: 'thermostat',
      label: 'Elevation & Temperatures',
      value: 'Sea level • 26°C – 31°C',
      note: 'Balmy sea breezes; the lanes are coolest before 10:00',
    },
    {
      icon: 'directions_car',
      label: 'Private Access Route',
      value: '2 hrs from Colombo',
      note: 'Via the Southern Expressway, about 4 hrs from Ella',
    },
  ],
  guideNote: {
    heading: 'Galle Fort Beyond the Lighthouse Photo',
    paragraphs: [
      'Most visitors see the lighthouse, buy a sarong and leave. I prefer to start at the Old Gate with its VOC crest, follow the rampart walk clockwise as the sun drops, and finish with a sundowner on Flag Rock while local boys dive from the bastion.',
    ],
    perks: [
      { icon: 'history_edu', label: 'Local Historian Walks' },
      { icon: 'diamond', label: 'Private Sapphire Viewing' },
      { icon: 'fort', label: 'Hidden Dutch Courtyards' },
    ],
  },
  experiences: [
    {
      kicker: '01 • Golden Hour',
      meta: 'Leisurely • 1.5 Hours • 17:00 Start',
      title: 'Flag Rock Bastion Sunset Walk',
      text: 'A slow loop of the coral-stone ramparts with a local historian, from the Old Gate past the clock tower and lighthouse to Flag Rock for the last light over the Indian Ocean.',
      tagIcon: 'history_edu',
      tagLabel: 'Local Historian Escort',
      image: 'about-living-architecture-galle',
    },
    {
      kicker: '02 • Living Heritage',
      meta: 'Gentle • 2 Hours • Morning',
      title: 'Hidden Dutch Courtyards & Merchant Mansions',
      text: 'Behind the shuttered façades of Church Street and Leyn Baan Street lie cool verandas, carved doorways and family courtyards I have known for years — opened for you by their owners.',
      tagIcon: 'fort',
      tagLabel: 'Private Courtyard Access',
      image: 'gallery-galle-ramparts-indigo',
    },
    {
      kicker: '03 • Craft',
      meta: 'Private • 1 Hour • By Appointment',
      title: 'Ceylon Sapphire Atelier Viewing',
      text: 'A calm, no-pressure viewing with a family of gem cutters who explain how a rough Ratnapura stone becomes a cornflower-blue sapphire. Looking is the point — buying is never expected.',
      tagIcon: 'diamond',
      tagLabel: 'No-Pressure Viewing',
    },
  ],
  fieldNotes: [
    {
      icon: 'directions_walk',
      title: 'Walk the Ramparts Clockwise',
      text: 'Starting at the Old Gate in the late afternoon keeps the sun behind you and brings you to Flag Rock exactly at sunset.',
    },
    {
      icon: 'church',
      title: 'Sunday Mornings',
      text: 'The Dutch Reformed Church holds services on Sunday mornings; we visit before or after so as not to disturb the congregation.',
    },
    {
      icon: 'privacy_tip',
      title: 'Gem Shop Touts',
      text: 'Friendly strangers offering a “museum visit” usually lead to a sales room. I only take guests to ateliers I trust — and only if you ask.',
    },
  ],
  interests: [
    'Rampart Sunset Walk',
    'Colonial Architecture',
    'Sapphire Ateliers',
    'Boutique Villas',
    'Cinnamon Island Cruise',
  ],
  mapPoints: [
    { name: 'Galle Lighthouse', lat: 6.024, lng: 80.2194 },
    { name: 'Flag Rock Bastion', lat: 6.0236, lng: 80.2161 },
    { name: 'Dutch Reformed Church', lat: 6.0283, lng: 80.2172 },
    { name: 'Clock Tower', lat: 6.0298, lng: 80.2163 },
    { name: 'Old Gate', lat: 6.0301, lng: 80.2189 },
  ],
  latitude: 6.0267,
  longitude: 80.217,
  elevation: 5,
  cover: 'dest-galle-card',
  gallery: [
    {
      image: 'dest-galle-lighthouse',
      title: 'The Lighthouse',
      caption: 'Ramparts against the evening swell',
    },
    {
      image: 'gallery-galle-ramparts-indigo',
      title: 'Ramparts in Indigo',
      caption: 'Church Street at twilight',
    },
    {
      image: 'tour-cultural-odyssey-galle-ramparts',
      title: 'Coral-Stone Bastions',
      caption: 'Built to guard the spice trade',
    },
  ],
}

const yala: SeedDestination = {
  slug: 'yala-bundala',
  region: 'wilderness-parks',
  name: 'Yala & Bundala',
  headline: 'Yala & Bundala: Leopard Dens, Untamed Scrublands & Lagoon Aviaries',
  tagline: 'Untamed Scrublands, Leopard Dens & Lagoon Aviaries',
  summary:
    'Home to the highest leopard density on earth, wild Asian elephant herds, and Bundala’s UNESCO biosphere where thousands of migratory flamingos gather.',
  description: [
    'Yala’s rocky outcrops, palu trees and coastal dunes shelter one of the densest leopard populations anywhere, alongside sloth bears, elephants, crocodiles and more than two hundred bird species. Next door, Bundala’s salt pans and lagoons are a winter home for flamingos and migratory waders.',
    'I work with a senior tracker who reads alarm calls and pug marks rather than radio chatter, and we favour the quieter blocks and corridors so that a sighting means stillness — engine off — not a traffic jam.',
  ].join('\n\n'),
  metaLabel: 'Deep Wilderness & Safari',
  badge: 'Leopard Sanctuary',
  bestTimeLabel: 'Feb – Jun (Peak Sightings)',
  curations: [
    'Dedicated modified custom 4x4 with senior wildlife tracker',
    'Quiet remote Block 5 and Lunugamvehera elephant corridor access',
    'Bundala salt pan migratory bird expedition with telephoto optics',
  ],
  quickFacts: [
    {
      icon: 'pets',
      label: 'Best Sighting Window',
      value: 'Feb – Jun',
      note: 'Low water levels draw leopards and elephants to the waterholes',
    },
    {
      icon: 'event_busy',
      label: 'Annual Rest Period',
      value: 'September – mid-October',
      note: 'Block 1 usually closes for a few weeks; Block 5 and Bundala stay open',
    },
    {
      icon: 'bedtime',
      label: 'Suggested Stay',
      value: '2 Nights',
      note: 'A dusk drive, a full dawn drive and an unhurried camp afternoon',
    },
    {
      icon: 'directions_car',
      label: 'Private Access Route',
      value: '2.5 hrs from Ella',
      note: 'Or about 3 hrs from Galle Fort along the coast',
    },
  ],
  guideNote: {
    heading: 'Why My Safaris Start Where the Jeeps Don’t',
    paragraphs: [
      'Block 1 at 06:00 can feel like a car park. We often enter through quieter gates, follow the tracker’s instinct along the elephant corridors and wait — engine off, voices low — at a waterhole he trusts. The reward is a leopard that walks past on its own terms.',
    ],
    perks: [
      { icon: 'visibility', label: 'Senior Wildlife Tracker' },
      { icon: 'eco', label: 'Engine-Off Sightings' },
      { icon: 'forest', label: 'Quiet Block Access' },
    ],
  },
  experiences: [
    {
      kicker: '01 • Dawn Drive',
      meta: 'Gentle • 5 Hours • Gate Opening',
      title: 'Private Leopard Tracking with a Senior Tracker',
      text: 'A modified open 4x4 for your party only, packed breakfast under a tamarind tree and the patience to wait where the tracks are freshest.',
      tagIcon: 'pets',
      tagLabel: 'Modified Private 4x4',
      image: 'dest-yala-leopard-trail',
    },
    {
      kicker: '02 • Quiet Corridors',
      meta: 'Gentle • Full Day • Packed Lunch',
      title: 'Block 5 & the Lunugamvehera Elephant Corridor',
      text: 'Fewer vehicles, wilder country: riverine forest, rock pools and the corridor elephants use to move between parks.',
      tagIcon: 'forest',
      tagLabel: 'Low-Traffic Blocks',
      image: 'gallery-video-yala-tracking',
    },
    {
      kicker: '03 • Birdlife',
      meta: 'Easy • 3 Hours • Early Morning',
      title: 'Bundala Salt Pans & Migratory Flamingos',
      text: 'Between November and March the lagoons fill with greater flamingos, painted storks and visiting waders. Binoculars and a telephoto lens are in the vehicle.',
      tagIcon: 'emoji_nature',
      tagLabel: 'Telephoto Optics Provided',
    },
  ],
  fieldNotes: [
    {
      icon: 'eco',
      title: 'Engine-Off Protocol',
      text: 'At every sighting we switch off and keep our distance. If a jam forms, we leave — the animal’s comfort comes first.',
    },
    {
      icon: 'checkroom',
      title: 'Neutral Colours',
      text: 'Khaki, olive and sand tones are best. Bright white and red stand out against the scrub and unsettle wildlife.',
    },
    {
      icon: 'hourglass_top',
      title: 'Patience Pays',
      text: 'Leopards are most active in the first two hours of light. The longest waits have given my guests their finest sightings.',
    },
  ],
  interests: [
    'Leopard Safari',
    'Elephant Corridors',
    'Birding & Flamingos',
    'Luxury Tented Camp',
    'Wildlife Photography',
  ],
  mapPoints: [
    { name: 'Yala National Park (Block 1)', lat: 6.3725, lng: 81.5169 },
    { name: 'Palatupana Gate', lat: 6.2747, lng: 81.411 },
    { name: 'Bundala National Park', lat: 6.2, lng: 81.2167 },
    { name: 'Lunugamvehera National Park', lat: 6.35, lng: 81.18 },
    { name: 'Kirinda', lat: 6.2167, lng: 81.3333 },
  ],
  latitude: 6.3725,
  longitude: 81.5169,
  elevation: 30,
  cover: 'dest-yala-card',
  gallery: [
    { image: 'dest-yala-leopard-trail', title: 'On the Red Trail', caption: 'A male leopard on patrol' },
    {
      image: 'gallery-yala-leopard-boulder',
      title: 'The Sovereign of Kumbuk',
      caption: 'Block 1 at golden hour',
    },
    {
      image: 'corp-blueprint-yala-glamping',
      title: 'Tented Camp',
      caption: 'Luxury canvas beside a waterhole',
    },
  ],
}

const kandy: SeedDestination = {
  slug: 'kandy-knuckles',
  region: 'hill-country',
  name: 'Kandy & Knuckles',
  headline: 'Kandy & Knuckles: The Sacred Tooth Temple & a UNESCO Cloud Forest',
  tagline: 'The Sacred Tooth Temple & UNESCO Cloud Forest',
  summary:
    'Sri Lanka’s last royal kingdom steeped in ritual drum ceremonies, surrounded by the rugged Knuckles range where endemic orchids bloom.',
  description: [
    'Kandy was the last capital of the Sinhalese kings and still guards the island’s most sacred relic in the Temple of the Tooth. Drums and conch shells announce the evening puja, and every July or August the Esala Perahera fills the streets with torch-bearers and caparisoned elephants.',
    'An hour north, the Knuckles range rises into cloud forest — a UNESCO-listed wilderness of ridge trails, remote villages and endemic orchids that I explore with a local botanist.',
  ].join('\n\n'),
  metaLabel: 'Hill Country · UNESCO Biosphere',
  bestTimeLabel: 'Dec – Apr',
  curations: [
    'Private VIP inner-chamber morning puja at Temple of the Tooth',
    'Knuckles mountain cloud-forest trek with botanist',
    'Royal Peradeniya Botanical Walk exploring historic spice trees',
  ],
  quickFacts: [
    {
      icon: 'sunny',
      label: 'Best Climate Window',
      value: 'Dec – Apr',
      note: 'Plus July – August for the Esala Perahera pageant',
    },
    {
      icon: 'bedtime',
      label: 'Suggested Stay',
      value: '2 Nights',
      note: 'An evening puja, Peradeniya and a Knuckles trail day',
    },
    {
      icon: 'thermostat',
      label: 'Elevation & Temperatures',
      value: '500 m • 20°C – 29°C',
      note: 'Cooler on the Knuckles ridges (12°C – 20°C)',
    },
    {
      icon: 'directions_car',
      label: 'Private Access Route',
      value: '3 hrs from Colombo',
      note: 'Or 2.5 hrs from Sigiriya via Matale',
    },
  ],
  guideNote: {
    heading: 'Kandy at the Hour the Drums Begin',
    paragraphs: [
      'I bring guests to the Temple of the Tooth for the evening puja, when the drummers fill the octagon with sound and devotees carry lotus flowers up the stairs. Dressed in white, with offerings prepared, you are a respectful participant rather than a spectator.',
    ],
    perks: [
      { icon: 'temple_buddhist', label: 'Inner Sanctum Escort' },
      { icon: 'hiking', label: 'Knuckles Trail Permits' },
      { icon: 'local_florist', label: 'Botanist-Led Walks' },
    ],
  },
  experiences: [
    {
      kicker: '01 • Sacred Ritual',
      meta: 'Gentle • 1.5 Hours • Evening Puja',
      title: 'Evening Puja at the Temple of the Sacred Tooth Relic',
      text: 'Pre-arranged seating for the drum-and-horn ceremony, an escort through the inner sanctum and the stories behind the relic that legitimised Sri Lanka’s kings.',
      tagIcon: 'temple_buddhist',
      tagLabel: 'White Wraps Provided',
      image: 'gallery-temple-tooth-lamps',
    },
    {
      kicker: '02 • Cloud Forest',
      meta: 'Moderate • 5 Hours • 07:00 Start',
      title: 'Knuckles Range Cloud-Forest Trek with a Botanist',
      text: 'Ridge paths through montane forest and grassland, endemic lizards and orchids, and a home-cooked lunch in a village that was only reached by footpath until recently.',
      tagIcon: 'hiking',
      tagLabel: 'Permits Pre-Arranged',
      image: 'cat-trekking-knuckles',
    },
    {
      kicker: '03 • Botanical Heritage',
      meta: 'Leisurely • 2 Hours • Morning',
      title: 'Royal Botanic Gardens, Peradeniya',
      text: 'Giant Java fig trees, the royal palm avenue, a spice garden and an orchid house — 60 hectares laid out on a former royal pleasure garden beside the Mahaweli river.',
      tagIcon: 'park',
      tagLabel: 'Historic Spice Avenue',
    },
  ],
  fieldNotes: [
    {
      icon: 'checkroom',
      title: 'Temple Dress Code',
      text: 'White or light clothing, shoulders and knees covered, shoes left at the entrance. I bring clean wraps for everyone.',
    },
    {
      icon: 'celebration',
      title: 'Perahera Season',
      text: 'During the Esala Perahera (July or August) hotels fill a year ahead. Tell me early if you would like to see the procession.',
    },
    {
      icon: 'directions_walk',
      title: 'Lake Walk at Dusk',
      text: 'The 3 km path around Kandy Lake is lovely after the evening puja, when the temple lights reflect on the water.',
    },
  ],
  interests: [
    'Temple of the Tooth',
    'Knuckles Trekking',
    'Botanical Gardens',
    'Kandyan Dance',
    'Esala Perahera',
  ],
  mapPoints: [
    { name: 'Temple of the Sacred Tooth Relic', lat: 7.2936, lng: 80.6413 },
    { name: 'Kandy Lake', lat: 7.2925, lng: 80.6448 },
    { name: 'Royal Botanic Gardens, Peradeniya', lat: 7.269, lng: 80.5965 },
    { name: 'Knuckles Conservation Forest (Riverston)', lat: 7.528, lng: 80.735 },
    { name: 'Meemure Village', lat: 7.4283, lng: 80.8411 },
  ],
  latitude: 7.2906,
  longitude: 80.6337,
  elevation: 500,
  cover: 'dest-kandy-card',
  gallery: [
    { image: 'dest-kandy-temple-lake-twilight', title: 'Kandy Lake', caption: 'The golden roof at twilight' },
    {
      image: 'gallery-temple-tooth-lamps',
      title: 'Evening Thevava',
      caption: 'Lamps in the temple corridors',
    },
    { image: 'cat-trekking-knuckles', title: 'Knuckles Range', caption: 'Cloud forest ridges' },
  ],
}

const mirissa: SeedDestination = {
  slug: 'mirissa-weligama',
  region: 'south-coast',
  name: 'Mirissa & Weligama',
  headline: 'Mirissa & Weligama: Azure Bays, Stilt Fishermen & the Blue Whale Highway',
  tagline: 'Azure Bays, Blue Whale Marine Highway & Coconut Cliffs',
  summary:
    'Sun-drenched coastal retreat renowned for deep-sea blue whale passages, tranquil surf breaks, and secluded private beachfront estates.',
  description: [
    'Off Mirissa the continental shelf drops away close to shore, bringing blue whales, sperm whales and spinner dolphins within reach of a morning boat trip. Along the bays, stilt fishermen still perch above the surf and Weligama’s gentle waves make it the island’s classic place to learn to surf.',
    'I book small, licensed vessels that respect distance rules and pair the ocean days with quiet beach villas, coconut-cliff sunsets and slow seafood dinners.',
  ].join('\n\n'),
  metaLabel: 'Southern Coast · Whale Highway',
  bestTimeLabel: 'Nov – Apr',
  curations: [
    'Private catamaran charter with marine conservationist',
    'Sunset stilt fishermen portrait session at Ahangama',
    'Koggala Lake cinnamon plantation private launch cruise',
  ],
  quickFacts: [
    {
      icon: 'sunny',
      label: 'Best Climate Window',
      value: 'Nov – Apr',
      note: 'Glassy seas and the main blue whale season',
    },
    {
      icon: 'bedtime',
      label: 'Suggested Stay',
      value: '2 to 3 Nights',
      note: 'One dawn at sea, one slow beach day',
    },
    {
      icon: 'waves',
      label: 'Sea Temperature',
      value: '27°C – 29°C',
      note: 'Warm water all year in the sheltered coves',
    },
    {
      icon: 'directions_car',
      label: 'Private Access Route',
      value: '2.5 hrs from Colombo',
      note: 'About 45 mins from Galle Fort',
    },
  ],
  guideNote: {
    heading: 'Whales, Ethically',
    paragraphs: [
      'Whale watching here can be wonderful or chaotic. I charter small vessels with a marine conservationist on board, leave early before the big boats, and never chase — we let the whales set the distance.',
    ],
    perks: [
      { icon: 'sailing', label: 'Private Catamaran' },
      { icon: 'eco', label: 'Responsible Distance Rules' },
      { icon: 'photo_camera', label: 'Fair-Fee Stilt Fishermen Visit' },
    ],
  },
  experiences: [
    {
      kicker: '01 • Open Ocean',
      meta: 'Easy • 4 Hours • 06:30 Departure',
      title: 'Private Catamaran Charter with a Marine Conservationist',
      text: 'Coffee on deck as the sun rises, a briefing on the blue whales of the shelf edge and, often, spinner dolphins riding the bow on the way home.',
      tagIcon: 'sailing',
      tagLabel: 'Responsible Distance Protocol',
      image: 'dest-mirissa-blue-whale',
    },
    {
      kicker: '02 • Coastal Heritage',
      meta: 'Easy • 1 Hour • Sunset',
      title: 'Stilt Fishermen Portrait Session at Ahangama',
      text: 'An unhurried sunset with a fishing family who still use the poles, paid fairly for their time — not the staged photo stops by the main road.',
      tagIcon: 'photo_camera',
      tagLabel: 'Fair Fee Paid to Fishermen',
      image: 'insta-weligama-stilt-fishermen',
    },
    {
      kicker: '03 • Lagoon Calm',
      meta: 'Leisurely • 2 Hours • Late Afternoon',
      title: 'Koggala Lake Cinnamon Island Cruise',
      text: 'A private launch across the lake to a small island where a family peels cinnamon by hand, then mangrove channels and kingfishers at dusk.',
      tagIcon: 'kayaking',
      tagLabel: 'Private Launch',
    },
  ],
  fieldNotes: [
    {
      icon: 'medical_services',
      title: 'Before the Boat',
      text: 'The swell can be lively beyond the reef. Take sea-sickness tablets the night before and eat a light breakfast.',
    },
    {
      icon: 'surfing',
      title: 'Learn to Surf',
      text: 'Weligama’s sandy-bottomed bay is the gentlest place on the coast for a first lesson. I book patient, certified instructors.',
    },
    {
      icon: 'warning',
      title: 'Respect the Currents',
      text: 'Some beaches have strong rips, especially from May to October. Swim where locals swim and where I point out the safe coves.',
    },
  ],
  interests: ['Blue Whale Watching', 'Stilt Fishermen', 'Surf Lessons', 'Beach Villas', 'Snorkelling'],
  mapPoints: [
    { name: 'Mirissa Beach', lat: 5.9483, lng: 80.4716 },
    { name: 'Coconut Tree Hill', lat: 5.9437, lng: 80.4627 },
    { name: 'Weligama Bay', lat: 5.9739, lng: 80.4294 },
    { name: 'Ahangama Stilt Fishermen', lat: 5.973, lng: 80.37 },
    { name: 'Koggala Lake', lat: 5.999, lng: 80.333 },
  ],
  latitude: 5.9483,
  longitude: 80.4716,
  elevation: 5,
  cover: 'dest-mirissa-card',
  gallery: [
    { image: 'dest-mirissa-blue-whale', title: 'The Blue Whale Highway', caption: 'A fluke off Mirissa' },
    { image: 'insta-weligama-stilt-fishermen', title: 'Stilt Fishermen', caption: 'Weligama at sunset' },
    {
      image: 'gallery-blue-whale-fluke',
      title: 'Titan of the Trench',
      caption: 'The continental shelf edge',
    },
  ],
}

const nuwaraEliya: SeedDestination = {
  slug: 'nuwara-eliya',
  region: 'hill-country',
  name: 'Nuwara Eliya',
  headline: 'Nuwara Eliya: Little England, Alpine Gardens & High-Grown Ceylon Tea',
  tagline: 'Little England, Alpine Turf & High-Grown Ceylon Pekoe',
  summary:
    'The highest highland settlement in Ceylon, celebrated for temperate alpine gardens, fireside dining, and world-renowned orthodox high-grown tea factories.',
  description: [
    'Founded as a cool-climate retreat by British planters, Nuwara Eliya still has its red-brick post office, Tudor-style cottages, racecourse and rose gardens — all set among some of the highest tea estates in the world.',
    'I arrive by the scenic train, stay in heritage bungalows with log fires and open the doors of working factories, where the master tea-maker explains why high-grown leaf tastes so bright and delicate.',
  ].join('\n\n'),
  metaLabel: 'Hill Country · 1,868m',
  bestTimeLabel: 'Feb – May',
  curations: [
    '19th-century Hill Club private silver tea service',
    'Single-estate Pedro Tea Factory private drying-room tour',
    'Hakgala sub-tropical cliff gardens curated morning stroll',
  ],
  quickFacts: [
    {
      icon: 'sunny',
      label: 'Best Climate Window',
      value: 'Feb – May',
      note: 'Clear mornings; April is the festive highland season',
    },
    {
      icon: 'bedtime',
      label: 'Suggested Stay',
      value: '2 Nights',
      note: 'A factory visit, Hakgala and Horton Plains',
    },
    {
      icon: 'thermostat',
      label: 'Elevation & Temperatures',
      value: '1,868 m • 11°C – 21°C',
      note: 'Bring a warm layer for fireside evenings',
    },
    {
      icon: 'train',
      label: 'Private Access Route',
      value: '3.5 hrs Scenic Rail',
      note: 'Kandy (Peradeniya) to Nanu Oya in an observation carriage',
    },
  ],
  guideNote: {
    heading: 'Tea Country at Walking Pace',
    paragraphs: [
      'Nuwara Eliya rewards slowness: a morning in the fields with the pluckers, a factory tour while the withering lofts still smell of fresh leaf, and afternoon tea on a lawn as the mist comes in. I keep the driving short and the days unhurried.',
    ],
    perks: [
      { icon: 'local_cafe', label: 'Master Tea-Maker Cupping' },
      { icon: 'cottage', label: 'Heritage Bungalow Stays' },
      { icon: 'train', label: 'Observation Carriage Tickets' },
    ],
  },
  experiences: [
    {
      kicker: '01 • High-Grown Tea',
      meta: 'Gentle • 2 Hours • Morning',
      title: 'Pedro Estate Private Drying-Room Tour',
      text: 'From the plucking slopes to the withering lofts and rolling tables, followed by a cupping of Silver Tips, Orange Pekoe and Broken Orange Pekoe with the factory officer.',
      tagIcon: 'local_cafe',
      tagLabel: 'Master Tea-Maker Cupping',
      image: 'gallery-tea-pluckers-pedro',
    },
    {
      kicker: '02 • Colonial Rituals',
      meta: 'Leisurely • 1.5 Hours • Afternoon',
      title: 'Silver Tea Service at the Hill Club',
      text: 'Scones, cucumber sandwiches and a pot of estate tea in the panelled rooms of the 1876 Hill Club, with stories of the planters who built the town.',
      tagIcon: 'emoji_food_beverage',
      tagLabel: 'Heritage Club Access',
      image: 'tour-tea-mist-planter-veranda',
    },
    {
      kicker: '03 • Highland Gardens',
      meta: 'Gentle • 2 Hours • Morning',
      title: 'Hakgala Gardens Curated Morning Stroll',
      text: 'Roses, ferns and montane forest on the slopes of Hakgala rock — the legendary Ashok Vatika of the Ramayana — with the valley of Uva falling away below.',
      tagIcon: 'local_florist',
      tagLabel: 'Botanist Narration',
    },
  ],
  fieldNotes: [
    {
      icon: 'ac_unit',
      title: 'Warm Layers',
      text: 'Nights can drop below 10°C from December to February. A fleece or wool wrap is essential.',
    },
    {
      icon: 'no_photography',
      title: 'Factory Photography',
      text: 'Some estates do not allow photos inside the factory. I always ask first, and the pluckers are photographed only with permission.',
    },
    {
      icon: 'celebration',
      title: 'April Season',
      text: 'Around the Sinhala and Tamil New Year the town fills with festivities, horse races and flower shows — lively, but book early.',
    },
  ],
  interests: ['Tea Factory Visits', 'Colonial High Tea', 'Horton Plains', 'Gregory Lake', 'Scenic Train'],
  mapPoints: [
    { name: 'Gregory Lake', lat: 6.9567, lng: 80.7783 },
    { name: 'Pedro Tea Estate', lat: 6.9636, lng: 80.8064 },
    { name: 'Hakgala Botanical Garden', lat: 6.9269, lng: 80.8197 },
    { name: 'The Hill Club', lat: 6.9706, lng: 80.7708 },
    { name: 'Nanu Oya Station', lat: 6.9425, lng: 80.74 },
  ],
  latitude: 6.9497,
  longitude: 80.7891,
  elevation: 1868,
  cover: 'dest-nuwara-eliya-card',
  gallery: [
    { image: 'dest-nuwara-eliya-post-office', title: 'Little England', caption: 'The red-brick post office' },
    {
      image: 'gallery-tea-pluckers-pedro',
      title: 'Two Leaves and a Bud',
      caption: 'Harvest on the Pedro slopes',
    },
    {
      image: 'tour-tea-mist-victorian-bungalow',
      title: 'Planter’s Bungalow',
      caption: 'Roses and mist in the valley',
    },
  ],
}

const trincomalee: SeedDestination = {
  slug: 'trincomalee-pasikudah',
  region: 'east-coast',
  name: 'Trincomalee & Pasikudah',
  headline: 'Trincomalee & Pasikudah: Deep Harbour, Koneswaram Cliff & Coral Reefs',
  tagline: 'Deep Natural Harbor, Koneswaram Cliff & Coral Reefs',
  summary:
    'Unspoiled east coastline blessed with crystal-still shallow bays, vibrant coral life at Pigeon Island, and thousands of years of Tamil naval history.',
  description: [
    'When the south-west monsoon brings rain to the southern beaches, the east coast enjoys its best months: calm turquoise water, coral gardens off Pigeon Island and long, empty beaches from Nilaveli to Pasikudah.',
    'Trincomalee’s deep natural harbour has drawn sailors for millennia, and the Koneswaram temple on Swami Rock is one of the most sacred Hindu shrines on the island — especially at sunset, when the devotional chants begin.',
  ].join('\n\n'),
  metaLabel: 'East Coast · Marine Sanctuary',
  bestTimeLabel: 'May – Sep (Calm Waters)',
  curations: [
    'Swami Rock temple cliff sunset with Hindu devotional chants',
    'Pigeon Island private boat snorkeling with reef sharks',
    'Secluded Marble Beach picnic with fresh seafood grill',
  ],
  quickFacts: [
    {
      icon: 'sunny',
      label: 'Best Climate Window',
      value: 'May – Sep',
      note: 'Calm, clear water while the south-west monsoon rains on the other coast',
    },
    {
      icon: 'bedtime',
      label: 'Suggested Stay',
      value: '3 Nights',
      note: 'Snorkelling, temple sunsets and a true beach rest',
    },
    {
      icon: 'waves',
      label: 'Sea Temperature',
      value: '28°C – 30°C',
      note: 'Shallow, sheltered bays that suit families',
    },
    {
      icon: 'directions_car',
      label: 'Private Access Route',
      value: '3 hrs from Sigiriya',
      note: 'Easily paired with the Cultural Triangle',
    },
  ],
  guideNote: {
    heading: 'The Coast That Shines When the South Rains',
    paragraphs: [
      'For travellers coming between May and September I often swap the southern beaches for the east: the Cultural Triangle is only a few hours away, the sea is calm and the beaches are blissfully uncrowded.',
    ],
    perks: [
      { icon: 'scuba_diving', label: 'Private Snorkel Boat' },
      { icon: 'temple_hindu', label: 'Temple Sunset Visit' },
      { icon: 'beach_access', label: 'Quiet Beach Villas' },
    ],
  },
  experiences: [
    {
      kicker: '01 • Sacred Cliff',
      meta: 'Easy • 1.5 Hours • Sunset',
      title: 'Koneswaram Temple at Swami Rock',
      text: 'The “temple of a thousand pillars” on a cliff above the sea — evening devotional chants, the lovers’ leap viewpoint and, from March to April, the chance of whales below.',
      tagIcon: 'temple_hindu',
      tagLabel: 'Devotional Chants at Dusk',
      image: 'dest-trincomalee-koneswaram',
    },
    {
      kicker: '02 • Reef Life',
      meta: 'Easy • Half Day • 07:00 Boat',
      title: 'Pigeon Island Private Snorkelling',
      text: 'A private boat to the marine national park before the day trippers, with blacktip reef sharks, turtles and parrotfish over the coral gardens.',
      tagIcon: 'scuba_diving',
      tagLabel: 'Reef-Safe Sunscreen Provided',
    },
  ],
  fieldNotes: [
    {
      icon: 'scuba_diving',
      title: 'Reef Etiquette',
      text: 'Never stand on or touch the coral. I provide reef-safe sunscreen and well-fitting masks for every guest.',
    },
    {
      icon: 'checkroom',
      title: 'Temple Dress',
      text: 'At Hindu kovils men may be asked to remove shirts and everyone removes shoes. A sarong or wrap is useful.',
    },
    {
      icon: 'calendar_month',
      title: 'Plan by Season',
      text: 'October to January brings the north-east monsoon here — then I point guests to the south and west coasts instead.',
    },
  ],
  interests: ['Snorkelling', 'Koneswaram Temple', 'Beach Leisure', 'Whale Watching', 'Tamil Heritage'],
  mapPoints: [
    { name: 'Koneswaram Temple', lat: 8.58, lng: 81.2459 },
    { name: 'Pigeon Island National Park', lat: 8.7225, lng: 81.2058 },
    { name: 'Nilaveli Beach', lat: 8.696, lng: 81.189 },
    { name: 'Marble Beach', lat: 8.512, lng: 81.215 },
    { name: 'Pasikudah Bay', lat: 7.927, lng: 81.561 },
  ],
  latitude: 8.5874,
  longitude: 81.2152,
  elevation: 10,
  cover: 'dest-trincomalee-card',
  gallery: [
    { image: 'dest-trincomalee-koneswaram', title: 'Swami Rock', caption: 'Koneswaram above the bay' },
    { image: 'dest-trincomalee-card', title: 'Sapphire Shores', caption: 'Pigeon Island reef offshore' },
  ],
}

const ancientCities: SeedDestination = {
  slug: 'anuradhapura-polonnaruwa',
  region: 'cultural-triangle',
  name: 'Anuradhapura & Polonnaruwa',
  headline: 'Anuradhapura & Polonnaruwa: Sacred Stupas, Royal Palaces & Colossal Stone Buddhas',
  tagline: 'Ancient Capitals, the Sacred Bodhi & Gal Vihara Masterpieces',
  summary:
    'Two UNESCO royal capitals spanning fifteen centuries — towering stupas, the world’s oldest documented tree and serene granite Buddhas, explored by bicycle at an unhurried pace.',
  description: [
    'Anuradhapura ruled for more than a thousand years: its great stupas rival the pyramids in scale and the Sri Maha Bodhi, grown from a cutting of the Buddha’s own tree, is still venerated daily. Polonnaruwa, the medieval capital, is more compact — palaces, audience halls and the sublime rock-cut Buddhas of Gal Vihara.',
    'I explore both early or late in the day, by vintage bicycle where the paths allow, with the stories that bring the stones back to life.',
  ].join('\n\n'),
  metaLabel: 'Cultural Triangle · UNESCO',
  bestTimeLabel: 'Dec – Sep',
  curations: [
    'Vintage-bicycle ride through Polonnaruwa’s royal precinct',
    'Gal Vihara at first light with a heritage lecturer',
    'Evening pirith chanting at the Sri Maha Bodhi',
  ],
  quickFacts: [
    {
      icon: 'sunny',
      label: 'Best Climate Window',
      value: 'Dec – Sep',
      note: 'Dry, bright days; carry water and a sun hat',
    },
    {
      icon: 'bedtime',
      label: 'Suggested Stay',
      value: '1 to 2 Nights',
      note: 'Usually explored from a Sigiriya base',
    },
    {
      icon: 'thermostat',
      label: 'Elevation & Temperatures',
      value: '60 m • 25°C – 34°C',
      note: 'Early mornings and late afternoons are kindest',
    },
    {
      icon: 'directions_car',
      label: 'Private Access Route',
      value: '1 hr from Sigiriya',
      note: 'Polonnaruwa; Anuradhapura is about 1.5 hrs',
    },
  ],
  guideNote: {
    heading: 'Reading the Stones',
    paragraphs: [
      'I trained among conservators at these sites, and I love showing guests the details most people walk past: moonstones whose carved rings describe the cycle of rebirth, guard stones with cobra kings, and the engineering of tanks that still irrigate the plains.',
    ],
    perks: [
      { icon: 'directions_bike', label: 'Vintage Bicycles' },
      { icon: 'history_edu', label: 'Heritage Lecturer' },
      { icon: 'wb_twilight', label: 'Early-Light Visits' },
    ],
  },
  experiences: [
    {
      kicker: '01 • Royal Precinct',
      meta: 'Gentle • 3 Hours • 07:00 Start',
      title: 'Polonnaruwa by Vintage Bicycle',
      text: 'Shaded paths between the royal palace, the council chamber and the Quadrangle, with breaks for king coconuts and the vehicle always close by.',
      tagIcon: 'directions_bike',
      tagLabel: 'Shaded Routes',
      image: 'cat-cultural-polonnaruwa',
    },
    {
      kicker: '02 • Masterpieces',
      meta: 'Easy • 1 Hour • Early Light',
      title: 'Gal Vihara Rock Sculptures',
      text: 'Four Buddha figures carved from a single granite face in the twelfth century — seated, standing and reclining — at their most luminous in the morning.',
      tagIcon: 'account_balance',
      tagLabel: 'Heritage Lecturer',
      image: 'tour-cultural-odyssey-gal-vihara',
    },
    {
      kicker: '03 • Living Faith',
      meta: 'Easy • 2 Hours • Dusk',
      title: 'Sri Maha Bodhi & the Great Stupas of Anuradhapura',
      text: 'White-clad pilgrims, oil lamps and chanting around the sacred fig, then the vast Ruwanwelisaya stupa glowing in the last light.',
      tagIcon: 'temple_buddhist',
      tagLabel: 'White Attire Recommended',
      image: 'insta-anuradhapura-monk',
    },
  ],
  fieldNotes: [
    {
      icon: 'do_not_step',
      title: 'Shoes Off, Socks On',
      text: 'Shoes come off at every shrine and the stones get hot by noon. Thin socks are allowed and save your feet.',
    },
    {
      icon: 'no_photography',
      title: 'Photos with Respect',
      text: 'Never pose with your back to a Buddha statue. I will show you the respectful angles that still make beautiful pictures.',
    },
    {
      icon: 'pets',
      title: 'Monkey Business',
      text: 'Toque macaques know that bags hold snacks. Keep food in the vehicle and zip pockets closed.',
    },
  ],
  interests: ['Ancient Ruins', 'Cycling', 'Buddhist Heritage', 'Archaeology', 'Photography'],
  mapPoints: [
    { name: 'Gal Vihara', lat: 7.9659, lng: 81.0059 },
    { name: 'Polonnaruwa Royal Palace', lat: 7.943, lng: 81.001 },
    { name: 'Parakrama Samudra', lat: 7.91, lng: 80.98 },
    { name: 'Ruwanwelisaya', lat: 8.35, lng: 80.3964 },
    { name: 'Sri Maha Bodhi', lat: 8.3446, lng: 80.3966 },
  ],
  latitude: 7.9403,
  longitude: 81.0188,
  elevation: 60,
  cover: 'cat-cultural-polonnaruwa',
  gallery: [
    {
      image: 'tour-cultural-odyssey-gal-vihara',
      title: 'Gal Vihara',
      caption: 'Twelfth-century rock-cut Buddhas',
    },
    {
      image: 'insta-anuradhapura-monk',
      title: 'Anuradhapura',
      caption: 'Brick colonnades of the first capital',
    },
    { image: 'corp-academic-polonnaruwa', title: 'Field Lecture', caption: 'Archaeology among the ruins' },
  ],
}

const udawalawe: SeedDestination = {
  slug: 'udawalawe',
  region: 'wilderness-parks',
  name: 'Udawalawe',
  headline: 'Udawalawe: Open Grasslands, Elephant Herds & the Elephant Transit Home',
  tagline: 'Asia’s Most Reliable Wild Elephant Encounters',
  summary:
    'Open savannah around a great reservoir where herds of wild Asian elephants graze in plain view — and where orphaned calves are rehabilitated for release back into the wild.',
  description: [
    'Udawalawe’s grasslands and scrub surround a large reservoir, and its resident elephant herds are seen on almost every drive. Water buffalo, crocodiles, eagles and the occasional leopard complete the picture.',
    'It is my favourite first safari for families: short, gentle drives, elephants close by, and a visit to the Elephant Transit Home, where orphaned calves are fed and prepared for life back in the wild — with no riding and no touching.',
  ].join('\n\n'),
  metaLabel: 'Deep Wilderness & Safari',
  badge: 'Elephant Sanctuary',
  bestTimeLabel: 'Year-Round',
  curations: [
    'Dawn jeep safari among grazing elephant herds',
    'Feeding-time visit to the Elephant Transit Home',
    'Junior naturalist kits for young explorers',
  ],
  quickFacts: [
    {
      icon: 'pets',
      label: 'Sighting Reliability',
      value: 'Year-Round',
      note: 'Elephants are seen on almost every drive',
    },
    { icon: 'bedtime', label: 'Suggested Stay', value: '1 Night', note: 'A dusk drive and a dawn drive' },
    {
      icon: 'thermostat',
      label: 'Elevation & Temperatures',
      value: '120 m • 24°C – 33°C',
      note: 'Hot at midday — drives run early and late',
    },
    {
      icon: 'directions_car',
      label: 'Private Access Route',
      value: '2 hrs from Ella',
      note: 'Or 2 hrs from Mirissa, on the way to Yala',
    },
  ],
  guideNote: {
    heading: 'An Easy Win for Young Travellers',
    paragraphs: [
      'Children remember Udawalawe for ever: a mother elephant dust-bathing beside the jeep, calves chasing each other through the grass. I give young guests binoculars and a field notebook so they can become the expedition’s official naturalists.',
    ],
    perks: [
      { icon: 'child_care', label: 'Junior Naturalist Kits' },
      { icon: 'eco', label: 'Engine-Off Viewing' },
      { icon: 'volunteer_activism', label: 'Ethical Visits Only' },
    ],
  },
  experiences: [
    {
      kicker: '01 • Dawn Drive',
      meta: 'Easy • 3 Hours • Gate Opening',
      title: 'Private Jeep Safari on the Open Grasslands',
      text: 'Herds grazing in the soft morning light, the reservoir glinting behind them, and a naturalist who knows the matriarchs by sight.',
      tagIcon: 'pets',
      tagLabel: 'Engine-Off Viewing',
      image: 'gallery-udawalawe-tusker',
    },
    {
      kicker: '02 • Conservation',
      meta: 'Easy • 1 Hour • Feeding Times',
      title: 'The Elephant Transit Home',
      text: 'Watch orphaned calves arrive for their milk feeds from a viewing platform — a conservation programme that has returned many elephants to the wild.',
      tagIcon: 'volunteer_activism',
      tagLabel: 'Ethical, Hands-Off Visit',
      image: 'tour-family-wonder-cover',
    },
  ],
  fieldNotes: [
    {
      icon: 'schedule',
      title: 'Feeding Times',
      text: 'The Transit Home feeds the calves at set times through the day. I plan the drive so that we arrive a few minutes early.',
    },
    {
      icon: 'cancel',
      title: 'No Riding, Ever',
      text: 'I never include elephant rides or bathing attractions. Seeing elephants wild and free is the far greater privilege.',
    },
    {
      icon: 'light_mode',
      title: 'Dust & Sun',
      text: 'Open jeeps are dusty in the dry months. Bring sunglasses, a hat and a light scarf; I carry wet towels and water.',
    },
  ],
  interests: ['Elephant Safari', 'Family Wildlife', 'Birding', 'Photography'],
  mapPoints: [
    { name: 'Udawalawe National Park', lat: 6.4333, lng: 80.8833 },
    { name: 'Elephant Transit Home', lat: 6.444, lng: 80.891 },
    { name: 'Udawalawe Reservoir', lat: 6.43, lng: 80.85 },
  ],
  latitude: 6.4333,
  longitude: 80.8833,
  elevation: 120,
  cover: 'gallery-udawalawe-tusker',
  gallery: [
    { image: 'cat-family-udawalawe', title: 'Calves at Play', caption: 'A family safari moment' },
    { image: 'tour-family-wonder-cover', title: 'Gentle Giants', caption: 'An elephant mother and calf' },
  ],
}

const colombo: SeedDestination = {
  slug: 'colombo',
  region: 'colombo-west',
  name: 'Colombo',
  headline: 'Colombo: Colonial Mansions, Bawa Modernism & Galle Face Sunsets',
  tagline: 'Colonial Cinnamon Mansions, Geoffrey Bawa Architecture & Coastal Sunsets',
  summary:
    'Sri Lanka’s lively maritime capital, where Dutch-era warehouses, cinnamon-garden mansions and Geoffrey Bawa’s tropical modernism meet street-food theatre on the Galle Face promenade.',
  description: [
    'Colombo is easy to skip and a pity to miss. In a single day you can walk the spice stalls of Pettah, visit a Buddhist temple filled with curiosities, step inside Geoffrey Bawa’s own townhouse and end with kites, kottu and a sunset on Galle Face Green.',
    'I usually plan one unhurried night here at the beginning or end of a journey — close to the airport, and a gentle introduction to the island.',
  ].join('\n\n'),
  metaLabel: 'Western Province · Capital',
  bestTimeLabel: 'Dec – Apr',
  curations: [
    'Private viewing of Geoffrey Bawa’s Number 11 townhouse',
    'Pettah market walk with a spice merchant',
    'Kottu theatre and sunset kites on Galle Face Green',
  ],
  quickFacts: [
    {
      icon: 'sunny',
      label: 'Best Climate Window',
      value: 'Dec – Apr',
      note: 'A year-round city stop; short showers May – Sep',
    },
    {
      icon: 'bedtime',
      label: 'Suggested Stay',
      value: '1 Night',
      note: 'Ideal for arrival or departure days',
    },
    {
      icon: 'thermostat',
      label: 'Temperatures',
      value: 'Sea level • 26°C – 31°C',
      note: 'Humid — walks are best in the morning and evening',
    },
    {
      icon: 'flight',
      label: 'Airport Transfer',
      value: '45 mins to BIA',
      note: 'Via the Katunayake Expressway',
    },
  ],
  guideNote: {
    heading: 'A Capital Worth a Night',
    paragraphs: [
      'After a long flight, a night in Colombo lets you rest before the road. And on the way home it is the perfect place for last-minute handloom textiles, tea and spices — with a farewell dinner by the sea.',
    ],
    perks: [
      { icon: 'architecture', label: 'Bawa Architecture Access' },
      { icon: 'restaurant', label: 'Vetted Street Food' },
      { icon: 'flight_takeoff', label: 'Close to the Airport' },
    ],
  },
  experiences: [
    {
      kicker: '01 • Architecture',
      meta: 'Easy • 2 Hours • By Appointment',
      title: 'Geoffrey Bawa’s Number 11',
      text: 'The architect’s own house, assembled from four bungalows down a narrow lane: courtyards, borrowed views and his collection of art and antiques, kept as he left it.',
      tagIcon: 'architecture',
      tagLabel: 'Private Viewing',
      image: 'review-mehra-bawa-courtyard',
    },
    {
      kicker: '02 • Street Food',
      meta: 'Easy • 2 Hours • After Dark',
      title: 'Colombo After Dark: Kottu, Crab & Galle Face Kites',
      text: 'The rhythmic clang of kottu blades, a famous crab curry and isso vadai by the sea — at stalls I trust, with the evening breeze and kites over the promenade.',
      tagIcon: 'restaurant',
      tagLabel: 'Hygiene-Vetted Stalls',
      image: 'blog-crab-curry',
    },
  ],
  fieldNotes: [
    {
      icon: 'commute',
      title: 'Traffic Timing',
      text: 'Weekday rush hours are slow. I schedule airport runs and city visits around them so you are never stuck in a jam.',
    },
    {
      icon: 'dark_mode',
      title: 'Poya Days',
      text: 'On each full-moon (Poya) day alcohol is not sold and some shops close — temples, though, are at their most beautiful.',
    },
    {
      icon: 'handshake',
      title: 'Handloom & Tea',
      text: 'For gifts I recommend fair-trade handloom studios and specialist tea merchants rather than airport shops.',
    },
  ],
  interests: ['Bawa Architecture', 'Street Food', 'Colonial Heritage', 'Handloom & Tea Shopping'],
  mapPoints: [
    { name: 'Galle Face Green', lat: 6.9246, lng: 79.8455 },
    { name: 'Gangaramaya Temple', lat: 6.9166, lng: 79.8564 },
    { name: 'Number 11 (Geoffrey Bawa House)', lat: 6.8968, lng: 79.8535 },
    { name: 'Pettah Market', lat: 6.9366, lng: 79.85 },
    { name: 'Parliament of Sri Lanka', lat: 6.8868, lng: 79.9187 },
  ],
  latitude: 6.9271,
  longitude: 79.8612,
  elevation: 5,
  cover: 'corp-gala-oceanfront',
  gallery: [
    {
      image: 'review-mehra-bawa-courtyard',
      title: 'Tropical Modernism',
      caption: 'Courtyards in the Bawa tradition',
    },
    {
      image: 'gallery-bawa-style-villa',
      title: 'Borrowed Landscapes',
      caption: 'Architecture open to the garden',
    },
    { image: 'blog-crab-curry', title: 'Colombo Crab', caption: 'A capital of flavours' },
  ],
}

const bentota: SeedDestination = {
  slug: 'bentota',
  region: 'colombo-west',
  name: 'Bentota',
  headline: 'Bentota: River Estuaries, Bawa Gardens & Golden West-Coast Sands',
  tagline: 'Lunuganga Gardens, River Safaris & Ayurvedic Retreats',
  summary:
    'A palm-fringed river-mouth resort on the west coast, home to Geoffrey Bawa’s Lunuganga estate, gentle estuary waters for boating and some of the island’s most respected Ayurveda retreats.',
  description: [
    'Where the Bentota river meets the sea, a long golden beach runs south past fishing villages and turtle hatcheries. Inland lies Lunuganga, the country garden Geoffrey Bawa shaped for fifty years, and his brother Bevis’s whimsical Brief Garden.',
    'Bentota is only ninety minutes from the airport, which makes it my favourite first or last stop — and the base for Ayurveda programmes with resident physicians.',
  ].join('\n\n'),
  metaLabel: 'Western Coast · River Estuary',
  bestTimeLabel: 'Nov – Apr',
  curations: [
    'Contemplative walk through Bawa’s Lunuganga gardens',
    'Bentota river and mangrove boat safari',
    'Kosgoda sea turtle conservation visit',
  ],
  quickFacts: [
    {
      icon: 'sunny',
      label: 'Best Climate Window',
      value: 'Nov – Apr',
      note: 'Calm seas for swimming; river trips year-round',
    },
    {
      icon: 'bedtime',
      label: 'Suggested Stay',
      value: '2 to 3 Nights',
      note: 'A natural first or last stop near the airport',
    },
    {
      icon: 'spa',
      label: 'Wellness',
      value: 'Ayurveda Retreats',
      note: 'Resident physicians and multi-day programmes',
    },
    {
      icon: 'directions_car',
      label: 'Private Access Route',
      value: '1.5 hrs from Colombo',
      note: 'Via the Southern Expressway',
    },
  ],
  guideNote: {
    heading: 'Where I Send Guests to Exhale',
    paragraphs: [
      'After the hill country and the parks, Bentota is about doing very little beautifully: a morning in Bawa’s garden, a boat drifting through the mangroves, an Ayurvedic treatment and a long swim when the sea is calm.',
    ],
    perks: [
      { icon: 'park', label: 'Lunuganga Garden Tour' },
      { icon: 'spa', label: 'Ayurveda Partners' },
      { icon: 'eco', label: 'Ethical Turtle Visit' },
    ],
  },
  experiences: [
    {
      kicker: '01 • Garden Architecture',
      meta: 'Gentle • 2 Hours • Morning',
      title: 'Lunuganga: Bawa’s Living Garden',
      text: 'Terraces, follies and framed views across Dedduwa lake — the place where Sri Lanka’s greatest architect experimented with landscape for half a century.',
      tagIcon: 'park',
      tagLabel: 'Private Garden Tour',
      image: 'blog-bawa-lunuganga',
    },
    {
      kicker: '02 • On the Water',
      meta: 'Easy • 2 Hours • Late Afternoon',
      title: 'Estuary Sailing & River Safari',
      text: 'Sail the sheltered estuary or drift up the Bentota river through mangrove tunnels, past monitor lizards, kingfishers and riverside temples.',
      tagIcon: 'sailing',
      tagLabel: 'Life Jackets for All Ages',
      image: 'corp-team-catamaran-regatta',
    },
    {
      kicker: '03 • Conservation',
      meta: 'Easy • 1 Hour • Evening',
      title: 'Kosgoda Sea Turtle Hatchery',
      text: 'A small community hatchery that protects eggs from poachers and releases hatchlings at night — visited quietly, without handling the turtles.',
      tagIcon: 'volunteer_activism',
      tagLabel: 'Ethical Visit',
    },
  ],
  fieldNotes: [
    {
      icon: 'waves',
      title: 'Monsoon Seas',
      text: 'From May to October the sea is rough on this coast. Swim only where it is safe — the river and the pool are lovely alternatives.',
    },
    {
      icon: 'spa',
      title: 'Ayurveda Consultation',
      text: 'Genuine retreats begin with a physician’s consultation. Allow at least three days for treatments to make a real difference.',
    },
    {
      icon: 'eco',
      title: 'Turtle Ethics',
      text: 'I avoid hatcheries that keep turtles in tanks for photos. The one we visit releases hatchlings straight to the sea.',
    },
  ],
  interests: ['Ayurveda', 'Bawa Architecture', 'River Safari', 'Beach Leisure', 'Turtle Conservation'],
  mapPoints: [
    { name: 'Bentota Beach', lat: 6.4183, lng: 79.9966 },
    { name: 'Lunuganga Estate', lat: 6.393, lng: 80.027 },
    { name: 'Bentota River Mouth', lat: 6.4255, lng: 79.9975 },
    { name: 'Kosgoda Turtle Hatchery', lat: 6.3355, lng: 80.0275 },
  ],
  latitude: 6.421,
  longitude: 79.998,
  elevation: 5,
  cover: 'corp-board-retreat-bawa-villa',
  gallery: [
    { image: 'blog-bawa-lunuganga', title: 'Lunuganga', caption: 'Bawa’s courtyard and lily pond' },
    {
      image: 'corp-team-catamaran-regatta',
      title: 'Estuary Sailing',
      caption: 'Calm water off the west coast',
    },
  ],
}

export const destinations: SeedDestination[] = [
  ella,
  sigiriya,
  galle,
  yala,
  kandy,
  mirissa,
  nuwaraEliya,
  trincomalee,
  ancientCities,
  udawalawe,
  colombo,
  bentota,
]
