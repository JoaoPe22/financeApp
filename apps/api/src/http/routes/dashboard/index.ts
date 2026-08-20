import { FastifyInstance } from 'fastify'

import { listarDashboard } from './listar-dashboard'

export const dashboardRoutes = async (app: FastifyInstance) => {
  app.register(listarDashboard)
}
