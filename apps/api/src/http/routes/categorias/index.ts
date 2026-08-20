import { FastifyInstance } from 'fastify'

import { atualizarCategoria } from './atualizar-categoria'
import { cadastrarCategoria } from './cadastrar-categoria'
import { deletarCategoria } from './deletar-categoria'
import { listarCategorias } from './listar-categorias'

export const categoriasRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarCategoria)
  app.register(listarCategorias)
  app.register(atualizarCategoria)
  app.register(deletarCategoria)
}
