import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastify from 'fastify'
import fastifyBetterAuth from 'fastify-better-auth'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { auth } from '@/auth'
import { auth as authMiddleware } from '@/http/middlewares'
import { env } from '@/lib/env'

import { errorHandler } from './error-handler'
import { dashboardRoutes } from './routes/dashboard'

const app = fastify({
  logger:
    process.env.NODE_ENV === 'production'
      ? {
          level: 'info',
          serializers: {
            req: (req) => ({
              method: req.method,
              url: req.url,
              headers: req.headers,
              remoteAddress: req.ip,
              remotePort: req.socket.remotePort,
            }),
            res: (res) => ({
              statusCode: res.statusCode,
            }),
          },
        }
      : true,
  trustProxy: true,
  requestTimeout: 30000,
  keepAliveTimeout: 72000,
  connectionTimeout: 0,
  bodyLimit: 10485760,
  requestIdHeader: 'x-request-id',
  return503OnClosing: true,
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifyCors, {
  origin: env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
})

app.register(fastifyBetterAuth, { auth })
app.register(fastifyMultipart)

app.register(authMiddleware)
app.register(dashboardRoutes)

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`Server está rodando no host http://0.0.0.0:${env.PORT}`)
})

export { app }
