// Placeholder de rotas do dashboard — ainda sem regras de negócio reais.
import type { FastifyInstance } from 'fastify'

const dashboardRoutes = async (app: FastifyInstance) => {
  app.register(async (app) => {
    app.get('/', async (request, reply) => {
      return { message: 'Dashboard route is working!' }
    })
  })
}

export { dashboardRoutes }
