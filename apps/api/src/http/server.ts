// Ponto de entrada da API Fastify: monta plugins (segurança, cors, rate limit),
// registra as rotas e sobe o servidor HTTP.
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { env } from '@/lib/env'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Libera apenas o front-end (Next.js) a chamar a API com cookies (credentials: true)
app.register(fastifyCors, {
  origin: env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
})

// Headers de segurança padrão (CSP, X-Frame-Options etc.)
app.register(fastifyHelmet)

// Limite global de requisições por IP, independente do rate limit próprio do better-auth
app.register(fastifyRateLimit, {
  global: true,
  max: 200,
  timeWindow: 60000,
  keyGenerator: (request) => request.ip,
})

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`Server está rodando no host http://0.0.0.0:${env.PORT}`)
})

export { app }
