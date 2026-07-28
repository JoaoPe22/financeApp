import type { FastifyInstance } from 'fastify'

const dashboardRoutes = async (app: FastifyInstance) => {
  app.get('/', async (request, reply) => {
    return { message: 'Dashboard route' }
  })
}

export { dashboardRoutes }
