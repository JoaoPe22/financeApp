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

import { errorHandler } from './error-handler'
import { categoriasRoutes } from './routes/categorias'
import { despesasFixasRoutes } from './routes/despesas-fixas'
import { despesasMensaisRoutes } from './routes/despesas-mensais'
import { perfilRoutes } from './routes/perfil'
import { planejamentosMensaisRoutes } from './routes/planejamentos-mensais'
import { receitasRoutes } from './routes/receitas'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
app.setErrorHandler(errorHandler)

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

app.register(perfilRoutes)
app.register(categoriasRoutes)
app.register(despesasFixasRoutes)
app.register(planejamentosMensaisRoutes)
app.register(despesasMensaisRoutes)
app.register(receitasRoutes)

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`Server está rodando no host http://0.0.0.0:${env.PORT}`)
})

export { app }
