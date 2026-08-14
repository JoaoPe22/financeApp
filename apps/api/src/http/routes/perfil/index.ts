import { FastifyInstance } from 'fastify'

import { atualizarPerfil } from './atualizar-perfil'
import { buscarPerfil } from './buscar-perfil'
import { cadastrarPerfil } from './cadastrar-perfil'

export const perfilRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarPerfil)
  app.register(buscarPerfil)
  app.register(atualizarPerfil)
}
