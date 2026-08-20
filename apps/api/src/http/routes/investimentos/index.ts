import { FastifyInstance } from 'fastify'

import { atualizarInvestimento } from './atualizar-investimento'
import { cadastrarInvestimento } from './cadastrar-investimento'
import { deletarInvestimento } from './deletar-investimento'
import { listarInvestimentos } from './listar-investimentos'

export const investimentosRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarInvestimento)
  app.register(listarInvestimentos)
  app.register(atualizarInvestimento)
  app.register(deletarInvestimento)
}
