// Ponto de entrada da API Fastify: monta plugins (segurança, cors, rate limit),
// registra as rotas e sobe o servidor HTTP.
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifySse from '@fastify/sse'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { env } from '@/lib/env'

import { errorHandler } from './error-handler'
import { categoriasRoutes } from './routes/categorias'
import { chatFinanceiroRoutes } from './routes/chat-financeiro'
import { contasBancariasRoutes } from './routes/contas-bancarias'
import { dashboardRoutes } from './routes/dashboard'
import { despesasFixasRoutes } from './routes/despesas-fixas'
import { despesasMensaisRoutes } from './routes/despesas-mensais'
import { investimentosRoutes } from './routes/investimentos'
import { objetivosRoutes } from './routes/objetivos'
import { parcelamentosRoutes } from './routes/parcelamentos'
import { perfilRoutes } from './routes/perfil'
import { planejamentosMensaisRoutes } from './routes/planejamentos-mensais'
import { receitasRoutes } from './routes/receitas'
import { reservasRoutes } from './routes/reservas'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
app.setErrorHandler(errorHandler)

// Libera apenas o front-end (Next.js) a chamar a API com cookies (credentials: true)
app.register(fastifyCors, {
  origin: env.FRONTEND_URL || 'http://localhost:4565',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
})

// Headers de segurança padrão (CSP, X-Frame-Options etc.)
app.register(fastifyHelmet)

// Server-Sent Events, usado pelo streaming do chat financeiro
app.register(fastifySse)

// Limite global de requisições por IP, independente do rate limit próprio do better-auth
app.register(fastifyRateLimit, {
  global: true,
  max: 200,
  timeWindow: 60000,
  keyGenerator: (request) => request.ip,
})

app.register(perfilRoutes)
app.register(categoriasRoutes)
app.register(contasBancariasRoutes)
app.register(despesasFixasRoutes)
app.register(planejamentosMensaisRoutes)
app.register(despesasMensaisRoutes)
app.register(receitasRoutes)
app.register(parcelamentosRoutes)
app.register(investimentosRoutes)
app.register(objetivosRoutes)
app.register(reservasRoutes)
app.register(chatFinanceiroRoutes)
app.register(dashboardRoutes)

app.listen({ port: env.PORT, host: env.HOST }).then(() => {
  console.log(`Server está rodando no host http://${env.HOST}:${env.PORT}`)
})

export { app }
