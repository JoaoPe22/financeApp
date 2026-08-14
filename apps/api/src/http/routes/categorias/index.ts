import { FastifyInstance } from 'fastify'

import { cadastrarCategoria } from './cadastrar-categoria'
import { listarCategorias } from './listar-categorias'

export const categoriasRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarCategoria)
  app.register(listarCategorias)
}
