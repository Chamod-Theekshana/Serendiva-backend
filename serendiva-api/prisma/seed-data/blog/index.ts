/**
 * Journal posts: the featured dispatch and six article cards of the blog screen (the three home page
 * "Stories & Insider Ceylon Notes" are among them) plus one Responsible Travel post.
 * Category slugs/labels follow the blog filter chips of the design.
 *
 * PLACEHOLDER SAMPLE CONTENT — to be reviewed/replaced by the client.
 */
import type { SeedBlogPost } from '../types'
import { sigiriyaAtDawn } from './sigiriya-at-dawn'
import { secretVantagePoints } from './secret-vantage-points'
import { blueTrain } from './blue-train'
import { cinnamonAndKottu } from './cinnamon-and-kottu'
import { yalaLeopards } from './yala-leopards'
import { bawaLegacy } from './bawa-legacy'
import { monsoonsDecoded } from './monsoons-decoded'
import { lowImpactJourneys } from './low-impact-journeys'

export const blogPosts: SeedBlogPost[] = [
  sigiriyaAtDawn,
  secretVantagePoints,
  blueTrain,
  cinnamonAndKottu,
  yalaLeopards,
  bawaLegacy,
  monsoonsDecoded,
  lowImpactJourneys,
]
