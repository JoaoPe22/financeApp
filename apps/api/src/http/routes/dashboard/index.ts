import type { FastifyInstance } from 'fastify'

import { auth } from '@/http/middlewares'

const dashboardRoutes = async (app: FastifyInstance) => {
  app.register(auth)

  app.get('/', async (_request, _reply) => {
    return { message: 'Dashboard route' }
  })
}

export { dashboardRoutes }
