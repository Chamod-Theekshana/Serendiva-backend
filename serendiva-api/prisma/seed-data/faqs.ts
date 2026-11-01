/**
 * FAQs by scope. Array order = display order.
 * - general: home page "Everything You Need to Know"
 * - booking: plan-my-trip "Bespoke Planning FAQ" followed by the tours page FAQ
 * - corporate: corporate page "Frequently Addressed Inquiries"
 * - tour: The Cultural Odyssey page
 * - destination: Ella (written for the seed)
 *
 * Answers that mentioned payments were lightly reworded: no payments or bookings are taken on the website.
 *
 * PLACEHOLDER SAMPLE CONTENT from the client's Stitch design — to be reviewed/replaced by the client.
 */
import type { SeedFaq } from './types'

export const generalFaqs: SeedFaq[] = [
  {
    question: 'When is the ideal season to visit Sri Lanka?',
    answer:
      'Sri Lanka is an extraordinary year-round destination because it experiences two alternating monsoons. When the South and West coasts receive rain (May to September), the North and East coasts (Trincomalee, Pasikuda) enjoy clear sapphire skies and calm waters. From December to April, the South, West, and Central Highlands offer sublime sun.',
  },
  {
    question: 'How do I obtain the Tourist Visa / ETA?',
    answer:
      'Most international travelers can obtain an Electronic Travel Authorization (ETA) online prior to arrival via the official Sri Lankan immigration portal. We provide comprehensive step-by-step guidance and verification for all confirmed Serendiva guests.',
  },
  {
    question: 'What is the sacred temple dress code & etiquette?',
    answer:
      'When entering Buddhist and Hindu sanctuaries, shoulders and knees must be respectfully covered, and footwear and hats removed at temple thresholds. Wearing light-colored or pure white linen is considered auspicious and deeply appreciated by monks and devotees.',
  },
  {
    question: 'Is Sri Lanka safe for solo female & family travelers?',
    answer:
      "Sri Lanka is widely recognized as one of Asia's most welcoming and safe countries. With an SLTDA-licensed chauffeur lecturer accompanying you throughout the day, you benefit from constant local chaperonage, total privacy, and assistance across every transit point.",
  },
  {
    question: 'Currency, tipping customs & cash vs cards?',
    answer:
      'Major credit cards are accepted at boutique hotels and upscale restaurants. However, small Sri Lankan Rupee (LKR) notes are indispensable for roadside fruit vendors, safari trackers, and local temple offerings. We help you exchange currency upon arrival at premier commercial rates.',
  },
]

export const bookingFaqs: SeedFaq[] = [
  {
    question: 'Is there any fee or commitment to request an itinerary?',
    answer:
      'None whatsoever. Requesting an itinerary blueprint is completely complimentary. Dinesh will consult with you, recommend options, and revise your itinerary without any obligation or card requirement until you are 100% happy with the journey.',
  },
  {
    question: 'Can you handle airport pickup at odd hours like 2:00 AM or 3:00 AM?',
    answer:
      'Yes, seamlessly. Many international flights arrive at Bandaranaike International Airport in the middle of the night. Dinesh or an authorized Serendiva representative will personally wait for you at the arrivals gate holding a personalized name board, assist with your luggage, and escort you to your air-conditioned vehicle.',
  },
  {
    question: 'How do we handle hotel bookings and national park entry permits?',
    answer:
      'We provide full turn-key flexibility. We can either handle all boutique hotel reservations, private 4x4 safari tracker permits, and scenic rail tickets directly under our operator rates, or you are welcome to book preferred properties using your own points/accounts while we manage all ground transport and guide curations.',
  },
  {
    question: 'What if our travel dates change after designing the route?',
    answer:
      'Because you deal directly with Dinesh and not an automated booking algorithm, shifting dates is simple and stress-free. We will readily pivot your itinerary, check alternative hotel availability, and ensure seasonal recommendations remain optimized for your new window.',
  },
  {
    question: 'Can we modify any listed itinerary?',
    answer:
      'Absolutely. All itineraries shown are curated master-frameworks. We regularly swap accommodations for your preferred boutique tea bungalows or ocean villas, add layover rest days, or weave in unique regional curiosities.',
  },
  {
    question: 'What vehicles are used for private tours?',
    answer:
      'We maintain a dedicated fleet of modern, air-conditioned Toyota luxury vans and SUVs. Each vehicle features panoramic high-visibility tinted windows, complimentary Wi-Fi, chilled king coconut refreshments, and generous luggage stowage.',
  },
  {
    question: 'Are entrance tickets and permits included?',
    answer:
      'Yes. All UNESCO Cultural Triangle passes, wildlife sanctuary fees, scenic railway tickets, and private 4x4 safaris are pre-arranged and included in your tailored proposal, eliminating queue delays throughout your journey.',
  },
  {
    question: 'How do we confirm our journey?',
    answer:
      'Once you and Dinesh finalize the day-by-day plan, we reserve your selected villas and vehicle and send you a written confirmation. Nothing is paid or booked through this website — every detail is agreed with you personally, transparently and with zero hidden add-ons.',
  },
]

export const corporateFaqs: SeedFaq[] = [
  {
    question: 'How are corporate proposals and agreements handled?',
    answer:
      'Nothing is paid or booked through this website. After our first call I prepare a written proposal for your events or procurement team, and we agree every detail — programme, partners, timings and terms — directly and personally before anything is confirmed.',
  },
  {
    question: 'What are your cancellation and force majeure terms for large groups?',
    answer:
      'Every corporate programme has its own written agreement, and the change and cancellation terms are set out in it before you confirm. For estate buyouts and charters the partners’ own timelines apply, which I explain in the proposal. Airspace closures, travel advisories and other force majeure events are covered in the same agreement.',
  },
  {
    question: 'What level of insurance and passenger liability do you maintain?',
    answer:
      'My vehicles carry full passenger liability insurance through accredited Sri Lankan underwriters, and every charter partner (aviation and marine) holds its own commercial passenger certification under Civil Aviation Authority Sri Lanka (CAASL) and marine regulations. I share the certificates with your risk team on request.',
  },
  {
    question: 'Can you accommodate specialized dietary guidelines for multinational teams?',
    answer:
      'Yes, thoroughly. Our private executive chefs and partnered luxury properties routinely manage Halal-certified dining, strict Kosher sourcing, Jain vegetarianism, vegan culinary programs, and severe allergen-segregated food preparation. A comprehensive dietary manifest is compiled during Step 01 of our onboarding process.',
  },
]

/** Keyed by tour slug */
export const tourFaqs: Record<string, SeedFaq[]> = {
  'cultural-odyssey': [
    {
      question: 'Can we add an extra night in Ella or wildlife safari in Yala?',
      answer:
        'Absolutely. Every Serendiva blueprint is 100% customizable. We frequently extend this journey into the leopard territories of Yala National Park or the hiking hills of Ella. Simply note your preferences in the bespoke inquiry card on this page and Dinesh will remodel the pacing accordingly.',
    },
    {
      question: 'What is the required dress code for sacred temples in Kandy & Dambulla?',
      answer:
        'When entering sacred Buddhist premises in Sri Lanka, shoulders and knees must be respectfully covered, and shoes are removed at the gate. I suggest comfortable light-coloured cotton or linen. Your private vehicle carries clean, breathable wraps should you need an extra layer.',
    },
    {
      question: 'What happens if our flight arrives late at night?',
      answer:
        'I track your inbound flight in real time. Whether you land at 2:00 PM or 2:00 AM, I will be waiting at the arrival terminal with cold drinks for a calm, unhurried transfer to your hotel.',
    },
    {
      question: 'Is this itinerary suitable for children or mature travelers?',
      answer:
        "Yes. Because the vehicle and the guide are yours alone, I adapt the daily pace to your family. At Sigiriya we can climb at dawn, or enjoy accessible viewpoints from the water gardens if you prefer gentle walking.",
    },
  ],
}

/** Keyed by destination slug */
export const destinationFaqs: Record<string, SeedFaq[]> = {
  ella: [
    {
      question: 'How many nights should I spend in Ella?',
      answer:
        'I recommend two to three unhurried nights. That leaves one dawn for Little Adam’s Peak or Ella Rock, an afternoon at the Nine Arches Bridge and a planter’s tea tasting, and time to simply enjoy the valley view from your villa. One night works if you are passing through, but you will miss the best light.',
    },
    {
      question: 'Can I see the blue train cross the Nine Arches Bridge without the crowds?',
      answer:
        'Yes. Instead of the busy public embankment, I take guests to a private tea terrace with a clear view of the viaduct and check the day’s train times with station contacts, so we arrive a few minutes before the crossing rather than waiting for an hour.',
    },
    {
      question: 'Is it possible to climb both Little Adam’s Peak and Ella Rock?',
      answer:
        'With two nights, yes. Little Adam’s Peak is a gentle 1.5-hour return walk, ideal for sunrise. Ella Rock is a moderate half-day trek of about 4–5 hours, best started at first light before the heat clouds gather. I adapt both to your fitness and the weather on the day.',
    },
  ],
}
