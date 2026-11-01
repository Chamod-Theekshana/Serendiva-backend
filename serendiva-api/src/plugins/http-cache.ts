import { createHash } from 'node:crypto'
import fp from 'fastify-plugin'

/**
 * Adds Cache-Control and a weak ETag to successful GET responses of routes that opt in with
 * `config: { httpCache: { maxAge, swr } }`, and answers 304 when the client's ETag matches.
 */
export default fp(async (app) => {
  app.addHook('onSend', async (request, reply, payload) => {
    const cfg = request.routeOptions.config?.httpCache
    if (!cfg || request.method !== 'GET' || reply.statusCode !== 200) return payload
    if (typeof payload !== 'string' && !Buffer.isBuffer(payload)) return payload

    const etag = `W/"${createHash('sha1').update(payload).digest('base64url').slice(0, 27)}"`
    const scope = cfg.private ? 'private' : 'public'
    reply.header('Cache-Control', `${scope}, max-age=${cfg.maxAge}${cfg.swr ? `, stale-while-revalidate=${cfg.swr}` : ''}`)
    reply.header('ETag', etag)
    reply.header('Vary', 'Accept-Encoding')

    const ifNoneMatch = request.headers['if-none-match']
    if (ifNoneMatch && ifNoneMatch.split(',').map((s) => s.trim()).includes(etag)) {
      reply.code(304)
      return ''
    }
    return payload
  })
})

/** Default caching for public content: 60s fresh, 5 min stale-while-revalidate */
export const publicCache = { httpCache: { maxAge: 60, swr: 300 } } as const
