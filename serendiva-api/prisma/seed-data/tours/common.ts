/**
 * Inclusion lists shared by several sample tours (based on the Cultural Odyssey design screen).
 *
 * PLACEHOLDER SAMPLE CONTENT — to be reviewed/replaced by the client.
 */
import type { IconText } from '../types'

export const guideIncluded: IconText = {
  icon: 'verified',
  text: 'Dedicated licensed National Tourist Guide Lecturer (Dinesh Jayasuriya or vetted senior scholar) throughout the journey',
}

export const vehicleIncluded: IconText = {
  icon: 'directions_car',
  text: 'Private air-conditioned Toyota Prado SUV or VIP Luxury Van with unlimited mileage, expressway tolls & fuel',
}

export const refreshmentsIncluded: IconText = {
  icon: 'water_drop',
  text: 'Unlimited chilled Ceylon mineral water, fresh roadside king coconuts, and cold towels in-transit',
}

export const trainIncluded: IconText = {
  icon: 'train',
  text: 'Guaranteed First-Class Observation carriage tickets for the scenic tea country train',
}

export const accommodation = (
  nights: number,
  extra = 'with daily breakfasts and curated dinners',
): IconText => ({
  icon: 'hotel',
  text: `${nights} nights handpicked boutique luxury accommodations ${extra}`,
})

export const standardNotIncluded: IconText[] = [
  { icon: 'flight', text: 'International airline tickets to and from Colombo (Bandaranaike BIA)' },
  { icon: 'health_and_safety', text: 'Comprehensive personal travel, health, and baggage insurance' },
  { icon: 'wine_bar', text: 'Alcoholic beverages, premium spirits, and personal laundry services' },
  {
    icon: 'volunteer_activism',
    text: 'Discretionary gratuities for hotel bell staff, estate tea pluckers, and personal chauffeur-guide',
  },
  { icon: 'badge', text: 'Sri Lanka Electronic Travel Authorization (ETA) visa entry processing fee' },
]

/** Coordinates reused across itineraries */
export const P = {
  airport: { name: 'Bandaranaike International Airport', lat: 7.1808, lng: 79.8841 },
  negombo: { name: 'Negombo', lat: 7.2083, lng: 79.8358 },
  colombo: { name: 'Colombo', lat: 6.9271, lng: 79.8612 },
  dambulla: { name: 'Dambulla Cave Temple', lat: 7.8567, lng: 80.6492 },
  kandalama: { name: 'Kandalama Reservoir', lat: 7.8733, lng: 80.7036 },
  sigiriya: { name: 'Sigiriya Lion Rock', lat: 7.957, lng: 80.7603 },
  pidurangala: { name: 'Pidurangala Rock', lat: 7.9665, lng: 80.7598 },
  polonnaruwa: { name: 'Polonnaruwa (Gal Vihara)', lat: 7.9659, lng: 81.0059 },
  minneriya: { name: 'Minneriya National Park', lat: 8.0333, lng: 80.8667 },
  matale: { name: 'Matale Spice Gardens', lat: 7.4675, lng: 80.6234 },
  kandyTemple: { name: 'Temple of the Tooth, Kandy', lat: 7.2936, lng: 80.6413 },
  peradeniya: { name: 'Royal Botanic Gardens, Peradeniya', lat: 7.269, lng: 80.5965 },
  nanuOya: { name: 'Nanu Oya Station', lat: 6.9425, lng: 80.74 },
  nuwaraEliya: { name: 'Nuwara Eliya', lat: 6.9497, lng: 80.7891 },
  pedro: { name: 'Pedro Tea Estate', lat: 6.9636, lng: 80.8064 },
  gregoryLake: { name: 'Gregory Lake', lat: 6.9567, lng: 80.7783 },
  hakgala: { name: 'Hakgala Botanical Garden', lat: 6.9269, lng: 80.8197 },
  hatton: { name: 'Hatton', lat: 6.8916, lng: 80.5955 },
  ella: { name: 'Ella', lat: 6.8667, lng: 81.0466 },
  nineArches: { name: 'Nine Arches Bridge', lat: 6.8768, lng: 81.0608 },
  littleAdams: { name: "Little Adam's Peak", lat: 6.8689, lng: 81.0628 },
  ellaRock: { name: 'Ella Rock', lat: 6.8573, lng: 81.0381 },
  ravanaFalls: { name: 'Ravana Falls', lat: 6.8406, lng: 81.0544 },
  udawalawe: { name: 'Udawalawe National Park', lat: 6.4333, lng: 80.8833 },
  elephantTransitHome: { name: 'Elephant Transit Home', lat: 6.444, lng: 80.891 },
  yala: { name: 'Yala National Park', lat: 6.3725, lng: 81.5169 },
  bundala: { name: 'Bundala National Park', lat: 6.2, lng: 81.2167 },
  tangalle: { name: 'Tangalle', lat: 6.024, lng: 80.794 },
  mirissa: { name: 'Mirissa', lat: 5.9483, lng: 80.4716 },
  weligama: { name: 'Weligama Bay', lat: 5.9739, lng: 80.4294 },
  galleFort: { name: 'Galle Fort', lat: 6.0267, lng: 80.217 },
  maduGanga: { name: 'Madu Ganga Estuary', lat: 6.2853, lng: 80.0417 },
  bentota: { name: 'Bentota', lat: 6.421, lng: 79.998 },
  lunuganga: { name: 'Lunuganga Estate', lat: 6.393, lng: 80.027 },
  kosgoda: { name: 'Kosgoda Turtle Hatchery', lat: 6.3355, lng: 80.0275 },
} as const
