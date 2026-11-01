import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { LocaleQuery } from '@/lib/i18n'
import { publicCache } from '@/plugins/http-cache'
import { adminErrorResponses, errorResponses } from '@/lib/schemas'
import { AdminSettingsSchema, PublicSettingsSchema, SETTING_KEYS, SettingBodySchemas } from './settings.schemas'
import { createSettingsService } from './settings.service'

/** GET /api/v1/settings/public */
export const settingsPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createSettingsService(app.deps)

  app.get(
    '/settings/public',
    {
      config: publicCache,
      schema: {
        tags: ['Content'],
        summary: 'Site-wide settings (contact, guide, counters, hero slides, SEO defaults, review summary)',
        querystring: LocaleQuery,
        response: { 200: PublicSettingsSchema, ...errorResponses },
      },
    },
    async (req) => service.publicSettings(req.query.locale),
  )
}

/** /api/v1/admin/settings */
export const settingsAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createSettingsService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Settings']
  const security = [{ cookieAuth: [] }]

  app.get(
    '/settings',
    { schema: { tags, security, summary: 'All settings (raw translatable values) with media previews', response: { 200: AdminSettingsSchema, ...adminErrorResponses } } },
    async () => service.adminGet(),
  )

  // One route per key (PUT /settings/contact, /settings/guide, ...) so each body is validated and
  // documented with its own schema.
  for (const key of SETTING_KEYS) {
    app.put(
      `/settings/${key}`,
      {
        schema: {
          tags,
          security,
          summary: `Replace the "${key}" setting`,
          body: SettingBodySchemas[key],
          response: { 200: AdminSettingsSchema, ...adminErrorResponses },
        },
      },
      async (req) => service.update(key, req.body),
    )
  }

  // Any other key: 400 with the list of valid keys (static routes above take precedence).
  app.put(
    '/settings/:key',
    { schema: { hide: true, params: z.object({ key: z.string().max(60) }), response: { 200: AdminSettingsSchema, ...adminErrorResponses } } },
    async (req) => service.update(req.params.key, req.body),
  )
}
