/**
 * Ayurveda, Healing & Forest Silence — reconciles the tours-page card (8N/9D, "Sinharaja Rainforest →
 * Ella Foothills → South Coast") with the home card "Bespoke Ayurveda & Island Solitude"
 * (Bentota → Sinharaja → Weligama Bay). Card copy from the design; itinerary written for the seed.
 *
 * PLACEHOLDER SAMPLE CONTENT — to be reviewed/replaced by the client.
 */
import type { SeedTour } from '../types'
import { P, guideIncluded, refreshmentsIncluded, standardNotIncluded, vehicleIncluded } from './common'

const sinharaja = { name: 'Sinharaja Forest Reserve', lat: 6.4, lng: 80.5 }
const ellaFoothills = { name: 'Ella Foothills Retreat', lat: 6.85, lng: 81.07 }

export const ayurveda: SeedTour = {
  slug: 'ayurveda-healing-forest-silence',
  isFeatured: true,
  title: 'Ayurveda, Healing & Forest Silence',
  summary:
    'A restorative sanctuary journey designed to recalibrate mental and physical vitality. Daily consultations with resident Ayurvedic Vaidyas, endemic forest bathing, and private oceanfront meditation.',
  description: [
    'This journey begins with three days in a respected Ayurveda retreat in Bentota, where a resident physician assesses your constitution and prescribes treatments, diet and rest. From there we carry the practice with us — into the silence of the Sinharaja rainforest, the cool air of the Ella foothills and, finally, the ocean at Weligama.',
    'Mornings begin with pranayama and yoga, meals come from organic farms and gardens, and the days are never crowded. It is as much a pause as a journey.',
  ].join('\n\n'),
  cardTag: 'Holistic Rejuvenation',
  durationDays: 9,
  durationNights: 8,
  route: ['Bentota', 'Sinharaja Rainforest', 'Ella Foothills', 'Weligama Bay'],
  highlights: [
    'Resident Ayurvedic Doctor Consult',
    'Daily Dawn Pranayama & Yoga',
    'Farm-to-Table Organic Dining',
  ],
  badges: ['Holistic Rejuvenation', 'Resident Ayurvedic Doctor', 'UNESCO Rainforest'],
  overview: {
    kicker: 'Holistic Rejuvenation',
    heading: 'Treatments, Rainforest Silence and the Sound of the Sea',
    quote:
      'In Sinharaja the forest is so quiet that you hear the rain arrive minutes before it reaches you. I bring guests here to listen — it is the best medicine I know.',
  },
  keyFeatures: [
    {
      icon: 'medical_services',
      title: 'Resident Vaidya',
      text: 'Daily consultations with a qualified Ayurvedic physician.',
    },
    {
      icon: 'self_improvement',
      title: 'Dawn Pranayama & Yoga',
      text: 'Gentle daily practice in open-air pavilions.',
    },
    {
      icon: 'forest',
      title: 'UNESCO Rainforest Bathing',
      text: 'Silent walks in Sinharaja with a naturalist.',
    },
    {
      icon: 'eco',
      title: 'Farm-to-Table Dining',
      text: 'Organic meals tailored to your Ayurvedic constitution.',
    },
  ],
  included: [
    guideIncluded,
    vehicleIncluded,
    {
      icon: 'medical_services',
      text: 'Three-day Ayurveda programme in Bentota with physician consultations and daily treatments',
    },
    { icon: 'self_improvement', text: 'Daily dawn pranayama and yoga sessions with a certified teacher' },
    {
      icon: 'hotel',
      text: '8 nights in wellness retreats, a rainforest eco-lodge and an oceanfront villa with all meals',
    },
    refreshmentsIncluded,
  ],
  notIncluded: standardNotIncluded,
  routeSummary: '540 Kilometers · Coast, Rainforest & Highland Foothills',
  travellerTypes: ['solo', 'couple'],
  seasons: ['year-round'],
  cover: 'tour-ayurveda-cover',
  gallery: [
    {
      image: 'tour-ayurveda-sinharaja-yoga-deck',
      title: 'Rainforest Yoga Deck',
      caption: 'Morning sunbeams in Sinharaja',
    },
    { image: 'cat-ayurveda-pavilion', title: 'Ayurveda Pavilion', caption: 'Warm oils and lotus ponds' },
    { image: 'quiz-interest-ayurveda', title: 'Herbal Treatments', caption: 'Physician-guided therapies' },
    { image: 'responsible-sinharaja-hero', title: 'Sinharaja', caption: 'Mist over the virgin rainforest' },
  ],
  days: [
    {
      title: 'Arrival & Consultation in Bentota',
      description:
        'A short drive to an Ayurveda retreat on the west coast. The resident physician meets you for a full consultation and designs your programme of treatments, diet and rest.',
      drivingTime: 'Drive: ~1.5 hrs',
      meals: 'Lunch, Dinner',
      overnightArea: 'Bentota',
      details: [{ label: 'Wellness', value: 'Dosha assessment with the resident Vaidya' }],
      stops: [P.airport, P.bentota],
    },
    {
      title: 'Treatments, Herbal Garden & Rest',
      description:
        'Dawn pranayama by the river, morning treatments, a walk through the retreat’s herbal garden with the physician and long, quiet afternoons.',
      drivingTime: 'Retreat Day',
      meals: 'All Meals',
      overnightArea: 'Bentota',
      details: [{ label: 'Practice', value: 'Daily dawn pranayama & yoga' }],
      stops: [P.bentota],
    },
    {
      title: 'Lunuganga & a Contemplative Garden Walk',
      description:
        'Between treatments, a gentle morning in Geoffrey Bawa’s Lunuganga garden — terraces, framed views and stillness across Dedduwa lake.',
      drivingTime: 'Short Drive',
      meals: 'All Meals',
      overnightArea: 'Bentota',
      details: [{ label: 'Curated Highlight', value: 'Private walk in the Lunuganga garden' }],
      stops: [P.lunuganga],
    },
    {
      title: 'Into the Sinharaja Rainforest',
      description:
        'We drive inland to an eco-lodge on the edge of Sinharaja, a UNESCO-listed virgin rainforest. In the evening, a slow guided walk to listen to frogs and night birds.',
      drivingTime: 'Drive: ~3.5 hrs',
      meals: 'All Meals',
      overnightArea: 'Sinharaja',
      details: [{ label: 'Overnight Residence', value: 'Rainforest eco-lodge' }],
      stops: [P.bentota, sinharaja],
    },
    {
      title: 'Forest Bathing & Waterfall Meditation',
      description:
        'A silent morning walk with a naturalist through the forest — endemic birds, giant lianas and dappled light — ending with meditation beside a waterfall pool.',
      drivingTime: 'Forest Day',
      meals: 'All Meals',
      overnightArea: 'Sinharaja',
      isHighlight: true,
      details: [{ label: 'Curated Highlight', value: 'UNESCO rainforest bathing with a naturalist' }],
      stops: [sinharaja],
    },
    {
      title: 'To the Ella Foothills',
      description:
        'A scenic drive east into the hills to a small retreat in the Ella foothills, surrounded by tea and spice gardens. Herbal steam and an early night.',
      drivingTime: 'Drive: ~4 hrs',
      meals: 'All Meals',
      overnightArea: 'Ella Foothills',
      details: [{ label: 'Wellness', value: 'Herbal steam bath' }],
      stops: [sinharaja, ellaFoothills],
    },
    {
      title: 'Dawn Breathwork on the Ridge',
      description:
        'Pranayama at sunrise overlooking the Ella Gap, a gentle walk through the tea gardens and a farm-to-table lunch from the retreat’s organic plots.',
      drivingTime: 'Highland Leisure',
      meals: 'All Meals',
      overnightArea: 'Ella Foothills',
      details: [{ label: 'Culinary', value: 'Organic farm-to-table lunch' }],
      stops: [ellaFoothills, P.littleAdams],
    },
    {
      title: 'To the Ocean at Weligama Bay',
      description:
        'Down to the south coast and an oceanfront villa at Weligama. At sunset, a private meditation on the beach as the fishing boats return.',
      drivingTime: 'Drive: ~3.5 hrs',
      meals: 'All Meals',
      overnightArea: 'Weligama Bay',
      details: [{ label: 'Curated Highlight', value: 'Private oceanfront sunset meditation' }],
      stops: [ellaFoothills, P.weligama],
    },
    {
      title: 'Farewell & Airport Transfer',
      description:
        'A final morning practice by the sea and a light breakfast before the expressway to the airport.',
      drivingTime: 'Drive: ~2.5 hrs via Highway',
      meals: 'Breakfast',
      overnightArea: 'Departure',
      details: [{ label: 'Farewell', value: 'Herbal oils and tea blend to take home' }],
      stops: [P.weligama, P.airport],
    },
  ],
  categories: ['ayurveda-wellness'],
  destinations: ['bentota', 'ella', 'mirissa-weligama'],
}
