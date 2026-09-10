import z from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
  // Escuta apenas em loopback por padrão, para a API não ficar acessível a
  // outras máquinas da rede durante o desenvolvimento. Em produção (container,
  // proxy reverso) defina HOST=0.0.0.0 no ambiente.
  HOST: z.string().default('127.0.0.1'),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().nonempty(),
  BETTER_AUTH_URL: z.url(),
  FRONTEND_URL: z.url().default('http://localhost:4565'),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().nonempty(),
  SMTP_PASS: z.string().nonempty(),
  SMTP_FROM_NAME: z.string(),
  SMTP_FROM_EMAIL: z.email(),
  APPLICATION_TIMEZONE: z.string().default('America/Cuiaba'),
  // Opcional: a rota de chat retorna erro amigável em runtime se ausente,
  // em vez de derrubar a API inteira no boot.
  GEMINI_API_KEY: z.string().optional(),
})

const env = envSchema.parse(process.env)

export { env }
