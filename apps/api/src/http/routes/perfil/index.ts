import { FastifyInstance } from 'fastify'

import { cadastrarPerfil } from './cadastrar-perfil'

export const perfilRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarPerfil)
}
