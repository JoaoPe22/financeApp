import { FastifyInstance } from 'fastify'

import { atualizarDespesaFixa } from './atualizar-despesa-fixa'
import { cadastrarDespesaFixa } from './cadastrar-despesa-fixa'
import { deletarDespesaFixa } from './deletar-despesa-fixa'
import { listarDespesasFixas } from './listar-despesas-fixas'

export const despesasFixasRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarDespesaFixa)
  app.register(listarDespesasFixas)
  app.register(atualizarDespesaFixa)
  app.register(deletarDespesaFixa)
}
