/**
 * Gallery — the twelve "plates" of the gallery screen, its Instagram strip, the three "Cinematic
 * Chronicles" videos and the two guest-interview videos from the reviews page. Array order = display order.
 *
 * Category slugs (frontend labels): heritage (Sacred Heritage & Citadels), wildlife (Wildlife & Sanctuaries),
 * tea-country (Misty Tea Highlands), coasts (Pristine Coasts & Oceans), gastronomy (Gastronomy & Village),
 * portraits (Traveler Portraits).
 *
 * PLACEHOLDER SAMPLE CONTENT. The video URLs are obvious placeholders
 * (https://www.youtube.com/watch?v=PLACEHOLD01 …) and must be replaced with the client's real videos.
 */
import type { SeedGalleryItem } from './types'

const placeholderVideo = (n: number) =>
  `https://www.youtube.com/watch?v=PLACEHOLD${String(n).padStart(2, '0')}`

export const galleryItems: SeedGalleryItem[] = [
  // ---- Plates
  {
    type: 'image',
    image: 'gallery-sigiriya-dawn-aerial',
    category: 'heritage',
    title: 'The Sky Citadel Awakes',
    caption:
      'First ambient golden rays cutting through the dense forest canopy before private footpaths open to visitors.',
    location: 'Sigiriya Lion Citadel, Matale District',
  },
  {
    type: 'image',
    image: 'gallery-nine-arches-clouds',
    category: 'tea-country',
    title: 'Passing Through Clouds',
    caption: 'The 10:15 vintage passenger train rounding the Demodara viaduct.',
    location: 'Demodara, Ella (3,400 ft)',
  },
  {
    type: 'image',
    image: 'gallery-yala-leopard-boulder',
    category: 'wildlife',
    title: 'The Sovereign of Kumbuk',
    caption: 'Tracking Block 1 with our lead tracker Kanishka.',
    location: 'Yala National Park, Block 1',
  },
  {
    type: 'image',
    image: 'gallery-stilt-fishermen-dusk',
    category: 'coasts',
    title: 'Riti Panna Twilight',
    caption: 'Generational ocean equilibrium under shifting trade winds.',
    location: 'Weligama Bay, Southern Coast',
  },
  {
    type: 'image',
    image: 'gallery-tea-pluckers-pedro',
    category: 'tea-country',
    title: 'Two Leaves and a Bud',
    caption: 'Gentle harvest rhythms inside the Pedro Estate slopes.',
    location: 'Nuwara Eliya (6,200 ft)',
  },
  {
    type: 'image',
    image: 'gallery-temple-tooth-lamps',
    category: 'heritage',
    title: 'Evening Thevava Rituals',
    caption: 'Drums echo through ancient timber pillared ambulatories during private twilight admittance.',
    location: 'Sri Dalada Maligawa, Kandy',
  },
  {
    type: 'image',
    image: 'gallery-matale-spice-grove-feast',
    category: 'gastronomy',
    title: 'Spices of the Forest Floor',
    caption: 'A four-course village tasting cooked entirely over open cinnamon-wood fire.',
    location: 'Organic Spice Estate, Matale',
  },
  {
    type: 'image',
    image: 'gallery-blue-whale-fluke',
    category: 'wildlife',
    title: 'Titan of the Trench',
    caption: 'A blue whale sounding over the continental shelf at dawn.',
    location: 'Mirissa Deep Continental Shelf',
  },
  {
    type: 'image',
    image: 'gallery-galle-ramparts-indigo',
    category: 'heritage',
    title: 'Ramparts in Indigo',
    caption: 'Brass lanterns and Dutch colonnades as dusk settles over the fort.',
    location: 'Church Street, Galle Fort',
  },
  {
    type: 'image',
    image: 'gallery-thambili-polonnaruwa',
    category: 'portraits',
    title: 'Thambili & Tales',
    caption: 'Freshly opened king coconuts shared with a travelling family under the palms.',
    location: 'Ancient City of Polonnaruwa',
  },
  {
    type: 'image',
    image: 'gallery-worlds-end-mist',
    category: 'tea-country',
    title: 'The Great Abyss',
    caption: 'Mist parting over the escarpment to reveal tea valleys far below.',
    location: 'Horton Plains High Plateau',
  },
  {
    type: 'image',
    image: 'gallery-kandalama-water-lilies',
    category: 'heritage',
    title: 'Water Lilies of King Aggabodhi',
    caption:
      'A quiet pontoon crossing as evening storks and white-bellied sea eagles settle into the forest rim.',
    location: 'Kandalama Wewa, Dambulla',
  },
  // ---- Instagram strip of the gallery screen
  {
    type: 'image',
    image: 'gallery-spiced-milk-tea',
    category: 'gastronomy',
    title: 'Estate Milk Tea',
    caption: 'Spiced Ceylon tea with cinnamon quills and cardamom on a planter’s brass tray.',
    location: 'Hatton Tea Valley',
  },
  {
    type: 'image',
    image: 'gallery-bawa-style-villa',
    category: 'heritage',
    title: 'Tropical Modernism',
    caption: 'Concrete, water and jungle in the tradition of Geoffrey Bawa.',
    location: 'Bentota, Western Coast',
  },
  {
    type: 'image',
    image: 'gallery-udawalawe-tusker',
    category: 'wildlife',
    title: 'Tusker in the Grass',
    caption: 'A wild bull elephant crossing the golden savannah in the afternoon light.',
    location: 'Udawalawe National Park',
  },
  {
    type: 'image',
    image: 'gallery-ambalangoda-masks',
    category: 'gastronomy',
    title: 'Faces of Ambalangoda',
    caption: 'Hand-painted kolam and devil-dance masks in a family carving workshop.',
    location: 'Ambalangoda, Southern Coast',
  },
  {
    type: 'image',
    image: 'gallery-tangalle-cove',
    category: 'coasts',
    title: 'A Cove of Our Own',
    caption: 'White sand, leaning palms and dark rock pools near Tangalle.',
    location: 'Tangalle, Southern Coast',
  },
  {
    type: 'image',
    image: 'gallery-chauffeur-key-fob',
    category: 'portraits',
    title: 'Ready When You Are',
    caption: 'The day begins outside a colonial tea bungalow.',
    location: 'Nuwara Eliya',
  },
  // ---- Cinematic Chronicles (videos)
  {
    type: 'video',
    image: 'gallery-video-sigiriya-dawn',
    videoUrl: placeholderVideo(1),
    category: 'heritage',
    title: 'Dawn Over Sigiriya: Climbing the Sky Citadel Before the Crowds',
    caption:
      'An early 5:00 AM ascent revealing fifth-century frescoes and mirrored plaster walls bathed in morning light.',
    location: 'Sigiriya, Matale District',
  },
  {
    type: 'video',
    image: 'gallery-video-highland-railway',
    videoUrl: placeholderVideo(2),
    category: 'tea-country',
    title: 'The Highland Railway: From Kandy to the Tea Clouds of Ella',
    caption:
      'Rattling through high viaducts, water cascades, and fragrant mountain air aboard private reserved observation carriages.',
    location: 'Kandy to Ella Railway',
  },
  {
    type: 'video',
    image: 'gallery-video-yala-tracking',
    videoUrl: placeholderVideo(3),
    category: 'wildlife',
    title: 'Untamed Yala: Tracking the Apex Predator with Senior Naturalists',
    caption:
      'Patience, jungle acoustic signals, and tracking Sri Lanka’s solitary leopards deep within protected dry forest zones.',
    location: 'Yala National Park',
  },
  // ---- Guest interviews ("In Their Own Words" on the reviews page)
  {
    type: 'video',
    image: 'review-video-lindqvist-poster',
    videoUrl: placeholderVideo(4),
    category: 'portraits',
    title: 'Why We Would Never Do Sri Lanka Any Other Way',
    caption: 'The Lindqvist Family on their 10-day Ceylon Safari & Southern Beach Adventure.',
    location: 'Yala Safari Camp',
  },
  {
    type: 'video',
    image: 'review-video-pendelton-poster',
    videoUrl: placeholderVideo(5),
    category: 'portraits',
    title: 'A Golden Anniversary Beyond Our Imaginations',
    caption: 'Arthur & Eleanor reflect on unhurried travel, authentic friendships, and the grace of Ceylon.',
    location: 'Galle Fort',
  },
]
