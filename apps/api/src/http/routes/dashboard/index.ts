import type { FastifyInstance } from 'fastify'

const dashboardRoutes = async (app: FastifyInstance) => {
  app.get('/', async (_request, _reply) => {
    return { message: 'Dashboard route' }
  })
}

export { dashboardRoutes }
