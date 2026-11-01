import { brand, button, detailsTable, detailsText, esc, layout, p } from './layout'

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

export interface InquiryEmailData {
  reference: string
  name: string
  email: string
  whatsapp?: string | null
  country?: string | null
  partyType?: string | null
  adults: number
  children: number
  travelWindow?: string | null
  travelStart?: string | null
  travelEnd?: string | null
  flexibleDates: boolean
  flexibility?: string | null
  durationPreference?: string | null
  pace?: string | null
  stayStyle?: string | null
  interests: string[]
  tourTitle?: string | null
  tourUrl?: string | null
  destinationName?: string | null
  message?: string | null
  sourcePage?: string | null
  locale: string
  adminUrl: string
}

function waLink(number: string, text: string): string {
  const digits = number.replace(/[^\d]/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

export function guideInquiryEmail(d: InquiryEmailData): RenderedEmail {
  const travel = d.travelWindow ?? ([d.travelStart, d.travelEnd].filter(Boolean).join(' → ') || null)
  const rows: [string, string | null | undefined][] = [
    ['Reference', d.reference],
    ['Name', d.name],
    ['Email', d.email],
    ['WhatsApp', d.whatsapp],
    ['Country', d.country],
    ['Tour', d.tourTitle],
    ['Destination', d.destinationName],
    ['Travelling as', d.partyType],
    ['Guests', `${d.adults} adult(s)${d.children ? `, ${d.children} child(ren)` : ''}`],
    ['Travel dates', travel],
    ['Flexibility', d.flexibility ?? (d.flexibleDates ? 'Flexible dates' : null)],
    ['Duration', d.durationPreference],
    ['Pace', d.pace],
    ['Stay style', d.stayStyle],
    ['Interests', d.interests.length ? d.interests.join(', ') : null],
    ['Message', d.message],
    ['Sent from', d.sourcePage],
    ['Language', d.locale],
  ]
  const actions = [
    button(`mailto:${d.email}?subject=${encodeURIComponent(`Your Sri Lanka journey (${d.reference})`)}`, 'Reply by email', brand.primary),
    d.whatsapp ? button(waLink(d.whatsapp, `Ayubowan ${d.name}! Thank you for your inquiry ${d.reference}.`), 'Reply on WhatsApp', '#2c4e23') : '',
    d.tourUrl ? button(d.tourUrl, 'View tour', brand.cinnamon) : '',
  ].join('')
  return {
    subject: `New inquiry ${d.reference} — ${d.name}${d.tourTitle ? ` · ${d.tourTitle}` : ''}`,
    html: layout({
      preheader: `${d.name} sent a new travel inquiry`,
      title: `New inquiry from ${d.name}`,
      body: p('A visitor has sent a new inquiry through the website. Reply within 24 hours.') + detailsTable(rows) + `<div>${actions}</div>` + p(`<a href="${esc(d.adminUrl)}" style="color:${brand.teal}">Open in admin panel</a>`),
    }),
    text: `New inquiry ${d.reference}\n\n${detailsText(rows)}\n\nAdmin: ${d.adminUrl}`,
  }
}

export function visitorConfirmationEmail(d: { reference: string; name: string; whatsappNumber?: string | null; siteUrl: string; kind?: 'inquiry' | 'proposal' }): RenderedEmail {
  const isProposal = d.kind === 'proposal'
  const intro = isProposal
    ? 'Thank you for your corporate proposal request. I have received your brief and will prepare a tailored proposal.'
    : 'Thank you for your inquiry — I have received your travel preferences and will start planning your journey personally.'
  return {
    subject: `We received your ${isProposal ? 'proposal request' : 'inquiry'} (${d.reference})`,
    html: layout({
      preheader: `Your reference is ${d.reference}. I will reply within 24 hours.`,
      title: `Ayubowan, ${d.name}!`,
      body:
        p(esc(intro)) +
        `<div style="background:${brand.surface};border-left:3px solid ${brand.gold};padding:14px 18px;margin:0 0 18px;border-radius:6px;"><div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${brand.muted}">Your reference</div><div style="font-size:22px;font-weight:bold;color:${brand.primary};margin-top:4px">${esc(d.reference)}</div></div>` +
        p('<strong>I will reply within 24 hours.</strong> There is no payment and no obligation at this stage.') +
        (d.whatsappNumber ? p(`Need a quick answer? Message me on WhatsApp: ${button(waLink(d.whatsappNumber, `Hello! My reference is ${d.reference}.`), 'Chat on WhatsApp', '#2c4e23')}`) : '') +
        p('Warm regards,<br>Dinesh Jayasuriya<br><span style="color:#40484b;font-size:13px">Licensed National Tourist Guide Lecturer · Serendiva</span>'),
      footer: `You received this email because you contacted us at <a href="${esc(d.siteUrl)}" style="color:${brand.teal}">${esc(d.siteUrl.replace(/^https?:\/\//, ''))}</a>.`,
    }),
    text: `Ayubowan, ${d.name}!\n\n${intro}\n\nYour reference: ${d.reference}\nI will reply within 24 hours.\n\nDinesh Jayasuriya — Serendiva`,
  }
}

export interface ProposalEmailData {
  reference: string
  company: string
  contactPerson: string
  email: string
  phone: string
  groupSize: string
  dates: string
  eventType: string
  logistics: string[]
  message?: string | null
  attachmentUrl?: string | null
  attachmentName?: string | null
  adminUrl: string
}

export function guideProposalEmail(d: ProposalEmailData): RenderedEmail {
  const rows: [string, string | null | undefined][] = [
    ['Reference', d.reference],
    ['Company', d.company],
    ['Contact', d.contactPerson],
    ['Email', d.email],
    ['Phone', d.phone],
    ['Group size', d.groupSize],
    ['Dates', d.dates],
    ['Mission', d.eventType],
    ['Logistics', d.logistics.length ? d.logistics.join(', ') : null],
    ['Brief', d.message],
    ['Attachment', d.attachmentName],
  ]
  return {
    subject: `Corporate proposal request ${d.reference} — ${d.company}`,
    html: layout({
      preheader: `${d.company} requested a corporate proposal`,
      title: `Corporate proposal request: ${d.company}`,
      body:
        detailsTable(rows) +
        `<div>${button(`mailto:${d.email}?subject=${encodeURIComponent(`Serendiva proposal ${d.reference}`)}`, 'Reply by email', brand.primary)}${d.attachmentUrl ? button(d.attachmentUrl, 'Download brief', brand.cinnamon) : ''}</div>` +
        p(`<a href="${esc(d.adminUrl)}" style="color:${brand.teal}">Open in admin panel</a>`),
    }),
    text: `Corporate proposal request ${d.reference}\n\n${detailsText(rows)}\n\nAdmin: ${d.adminUrl}`,
  }
}

export function newsletterConfirmEmail(d: { confirmUrl: string; unsubscribeUrl: string }): RenderedEmail {
  return {
    subject: 'Please confirm your Serendiva subscription',
    html: layout({
      preheader: 'One click to confirm your subscription',
      title: 'Confirm your subscription',
      body:
        p('Thank you for joining the Serendiva dispatch — seasonal notes on wildlife migrations, festivals and quiet corners of Sri Lanka.') +
        `<div style="margin:8px 0 20px">${button(d.confirmUrl, 'Confirm subscription', brand.primary)}</div>` +
        p('<span style="font-size:13px;color:#40484b">If you did not sign up, simply ignore this email.</span>'),
      footer: `<a href="${esc(d.unsubscribeUrl)}" style="color:${brand.teal}">Unsubscribe</a>`,
    }),
    text: `Confirm your Serendiva subscription: ${d.confirmUrl}\n\nUnsubscribe: ${d.unsubscribeUrl}`,
  }
}
