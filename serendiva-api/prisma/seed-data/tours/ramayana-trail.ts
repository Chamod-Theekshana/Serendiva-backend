/**
 * Sacred Ramayana Heritage Trail — card copy from the design; itinerary written for the seed.
 * The design route ends at Ravana Ella; the sample itinerary adds Rumassala (Hanuman's herb mountain)
 * on the way back to the airport.
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

const munneswaram = { name: 'Munneswaram Temple', lat: 7.584, lng: 79.817 }
const manavari = { name: 'Manavari Temple', lat: 7.6091, lng: 79.8277 }
const waikkal = { name: 'Waikkal', lat: 7.2833, lng: 79.85 }
const ramboda = { name: 'Sri Bhakta Hanuman Temple, Ramboda', lat: 7.0525, lng: 80.695 }
const seethaAmman = { name: 'Seetha Amman Temple', lat: 6.9406, lng: 80.8335 }
const divurumpola = { name: 'Divurumpola Temple', lat: 6.9228, lng: 80.813 }
const ravanaCave = { name: 'Ravana Cave', lat: 6.866, lng: 81.048 }
const ussangoda = { name: 'Ussangoda', lat: 6.099, lng: 80.987 }
const rumassala = { name: 'Rumassala', lat: 6.0189, lng: 80.2397 }

export const ramayanaTrail: SeedTour = {
  slug: 'sacred-ramayana-heritage-trail',
  title: 'Sacred Ramayana Heritage Trail',
  summary:
    'Follow the Ramayana across the island — the Shiva shrines of Munneswaram and Manavari, Hanuman’s temple at Ramboda, Ashok Vatika and the Seetha Amman kovil, and the caves and falls of Ravana Ella — with a private Vedic scholar.',
  description: [
    'For many Hindu families, Sri Lanka is Lanka of the Ramayana. This journey visits the places tradition links to the epic: where Rama worshipped Shiva after the war, the gardens where Sita was held captive, the spot of her trial by fire, and the caves and waterfalls of Ravana’s kingdom.',
    'A Vedic scholar joins us at the main temples to explain the rituals and the stories, while I take care of timings, offerings and the comfort of every generation travelling with you.',
  ].join('\n\n'),
  cardTag: 'Vedic Heritage',
  durationDays: 7,
  durationNights: 6,
  route: ['Chilaw', 'Kandy', 'Nuwara Eliya', 'Ravana Ella', 'Rumassala'],
  highlights: [
    'Munneswaram & Manavari Temples',
    'Ashok Vatika Botanical Visit',
    'Private Vedic Scholar Host',
  ],
  badges: ['Spiritual Mythology', 'Vedic Scholar Host', 'Family Friendly'],
  overview: {
    kicker: 'Spiritual Mythology',
    heading: 'Walking Through the Pages of the Ramayana',
    quote:
      'Whether you come as a pilgrim or simply love a great story, standing in the misty gardens of Seetha Eliya makes the epic feel astonishingly close.',
  },
  keyFeatures: [
    {
      icon: 'temple_hindu',
      title: 'Sacred Kovils',
      text: 'Munneswaram, Manavari, Ramboda and Seetha Amman temples.',
    },
    {
      icon: 'auto_stories',
      title: 'Vedic Scholar Host',
      text: 'Rituals and legends explained at every major site.',
    },
    {
      icon: 'local_florist',
      title: 'Ashok Vatika',
      text: 'The gardens of Hakgala, linked to Sita’s captivity.',
    },
    { icon: 'water', title: 'Ravana Ella', text: 'The legendary caves and waterfalls of Ravana’s kingdom.' },
  ],
  included: [
    guideIncluded,
    vehicleIncluded,
    { icon: 'auto_stories', text: 'Private Vedic scholar host at Munneswaram, Seetha Amman and Divurumpola' },
    { icon: 'volunteer_activism', text: 'Temple offerings (pooja baskets) prepared for every shrine' },
    accommodation(6, 'with daily breakfasts and vegetarian-friendly dinners'),
    refreshmentsIncluded,
  ],
  notIncluded: standardNotIncluded,
  routeSummary: '720 Kilometers · 9 Ramayana Sites',
  travellerTypes: ['family', 'couple', 'group', 'solo'],
  seasons: ['year-round'],
  cover: 'tour-ramayana-cover',
  gallery: [
    {
      image: 'cat-ramayana-seetha-amman',
      title: 'Seetha Amman Kovil',
      caption: 'Mountain streams and incense',
    },
    { image: 'dest-ella-ravana-falls', title: 'Ravana Falls', caption: 'Cascades near Ella' },
    { image: 'gallery-temple-tooth-lamps', title: 'Kandy by Lamplight', caption: 'An evening of devotion' },
    { image: 'dest-ella-river-pool', title: 'Ravana Sanctuary', caption: 'Hidden rock pools in the forest' },
  ],
  days: [
    {
      title: 'Arrival & the Shiva Temples of Chilaw',
      description:
        'From the airport we drive north to Chilaw to visit Munneswaram, where tradition says Rama worshipped Shiva after the war, and the nearby Manavari temple with its sand-formed lingam. Overnight in a quiet lagoon resort.',
      drivingTime: 'Drive: ~1.5 hrs',
      meals: 'Lunch, Dinner',
      overnightArea: 'Waikkal',
      details: [{ label: 'Scholar Host', value: 'Puja at Munneswaram with your Vedic scholar' }],
      stops: [P.airport, munneswaram, manavari, waikkal],
    },
    {
      title: 'To the Hill Capital of Kandy',
      description:
        'A drive inland to Kandy. In the evening we visit the Temple of the Tooth and the Kataragama Devalaya within the royal precinct, followed by a walk around Kandy Lake.',
      drivingTime: 'Drive: ~3.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Kandy',
      details: [{ label: 'Attire Prep', value: 'White clothing recommended' }],
      stops: [waikkal, P.kandyTemple],
    },
    {
      title: 'Hanuman’s Temple at Ramboda & Arrival in Nuwara Eliya',
      description:
        'The road climbs through tea estates to the Sri Bhakta Hanuman temple at Ramboda, built where Hanuman is said to have searched for Sita. Afternoon arrival in Nuwara Eliya.',
      drivingTime: 'Drive: ~3 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Nuwara Eliya',
      details: [{ label: 'Curated Highlight', value: 'Hanuman temple with tea-country views' }],
      stops: [ramboda, P.nuwaraEliya],
    },
    {
      title: 'Ashok Vatika, Seetha Amman & Divurumpola',
      description:
        'The heart of the trail: the Seetha Amman temple beside the stream where Sita is said to have bathed, the Hakgala gardens identified with Ashok Vatika, and Divurumpola, the place of her trial by fire.',
      drivingTime: 'Short Drives',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Nuwara Eliya',
      isHighlight: true,
      details: [
        { label: 'Scholar Host', value: 'Readings from the Ramayana at Seetha Eliya' },
        { label: 'Botanical Visit', value: 'Hakgala (Ashok Vatika) gardens' },
      ],
      stops: [seethaAmman, P.hakgala, divurumpola],
    },
    {
      title: 'The Caves & Falls of Ravana Ella',
      description:
        'Down to Ella to visit the Ravana Cave, where legend says Sita was hidden, and the cascades of Ravana Falls. Evening with the valley views of the Ella Gap.',
      drivingTime: 'Drive: ~2.5 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Ella',
      details: [{ label: 'Trek Grade', value: 'Easy climb to the cave entrance' }],
      stops: [ravanaCave, P.ravanaFalls, P.ella],
    },
    {
      title: 'Ussangoda & Rumassala on the Southern Coast',
      description:
        'We follow the coast to Ussangoda, a red-earth plateau linked to Ravana’s legends, and Rumassala, the hill said to have fallen from Hanuman’s hands as he carried healing herbs. Overnight near Galle.',
      drivingTime: 'Drive: ~4 hrs',
      meals: 'Breakfast, Dinner',
      overnightArea: 'Galle',
      details: [{ label: 'Curated Highlight', value: 'Sunset over the bay from Rumassala' }],
      stops: [ussangoda, rumassala, P.galleFort],
    },
    {
      title: 'Farewell & Airport Transfer',
      description: 'A morning walk in Galle Fort if time allows, then the expressway to the airport.',
      drivingTime: 'Drive: ~2.5 hrs via Highway',
      meals: 'Breakfast',
      overnightArea: 'Departure',
      details: [{ label: 'Farewell', value: 'Blessed thread and tea gift from Dinesh' }],
      stops: [P.galleFort, P.airport],
    },
  ],
  categories: ['ramayana-trail'],
  destinations: ['kandy-knuckles', 'nuwara-eliya', 'ella', 'galle-fort'],
}
