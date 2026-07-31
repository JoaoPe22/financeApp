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
import { getLoggerConfig } from '@/lib/logger'

import { errorHandler } from './error-handler'
import { dashboardRoutes } from './routes/dashboard'
import { usuariosRoutes } from './routes/usuarios'

const { logger, disableRequestLogging } = getLoggerConfig()

const app = fastify({
  logger,
  trustProxy: true,
  requestTimeout: 30000,
  keepAliveTimeout: 72000,
  connectionTimeout: 0,
  bodyLimit: 10485760,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  disableRequestLogging,
  return503OnClosing: true,
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

// Log de uma linha por requisição, só em desenvolvimento (o logger em produção
// já tem seus próprios serializers — ver src/lib/logger.ts)
if (process.env.NODE_ENV !== 'production') {
  app.addHook('onResponse', (request, reply, done) => {
    request.log.info(
      {
        req: request,
        res: reply,
        responseTime: reply.elapsedTime,
        contentLength: reply.getHeader('content-length'),
      },
      'request completed',
    )
    done()
  })
}

// Headers de segurança padrão (CSP, X-Frame-Options etc.)
app.register(fastifyHelmet)

// Limite global de requisições por IP, independente do rate limit próprio do better-auth
app.register(fastifyRateLimit, {
  global: true,
  max: 200,
  timeWindow: 60000,
  keyGenerator: (request) => request.ip,
})

// Libera apenas o front-end (Next.js) a chamar a API com cookies (credentials: true)
app.register(fastifyCors, {
  origin: env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
})

app.register(usuariosRoutes)

app.register(dashboardRoutes)

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`Server está rodando no host http://0.0.0.0:${env.PORT}`)
})

export { app }
