import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_BETTER_AUTH_BASE_URL: z.url(),
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_APPLICATION_TIMEZONE: z.string().default('America/Cuiaba'),
  NEXT_PUBLIC_GEO_API_URL: z.url(),
})

const rawEnv = {
  NEXT_PUBLIC_BETTER_AUTH_BASE_URL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_BASE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APPLICATION_TIMEZONE:
    process.env.NEXT_PUBLIC_APPLICATION_TIMEZONE,
  NEXT_PUBLIC_GEO_API_URL: process.env.NEXT_PUBLIC_GEO_API_URL,
}

const env =
  process.env.NEXT_PHASE === 'phase-production-build'
    ? (rawEnv as unknown as z.infer<typeof envSchema>)
    : envSchema.parse(rawEnv)

export { env }
