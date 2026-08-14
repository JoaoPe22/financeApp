import { FastifyInstance } from 'fastify'

import { atualizarReceita } from './atualizar-receita'
import { cadastrarReceita } from './cadastrar-receita'
import { deletarReceita } from './deletar-receita'

export const receitasRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarReceita)
  app.register(atualizarReceita)
  app.register(deletarReceita)
}
