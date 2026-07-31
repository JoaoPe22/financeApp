import { z } from 'zod'

const envServerSchema = z.object({
  BETTER_AUTH_SECRET: z.string().nonempty(),
  BETTER_AUTH_URL: z.url(),
  DATABASE_URL: z.url(),
  SMTP_HOST: z.string().nonempty(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().nonempty(),
  SMTP_PASS: z.string().nonempty(),
  SMTP_FROM_NAME: z.string().nonempty(),
  SMTP_FROM_EMAIL: z.email(),
})

const rawEnv = {
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
}

const envServer =
  process.env.NEXT_PHASE === 'phase-production-build'
    ? (rawEnv as unknown as z.infer<typeof envServerSchema>)
    : envServerSchema.parse(rawEnv)

export { envServer }
