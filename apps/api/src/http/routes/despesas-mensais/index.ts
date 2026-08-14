import { FastifyInstance } from 'fastify'

import { atualizarDespesaMensal } from './atualizar-despesa-mensal'
import { atualizarStatusDespesaMensal } from './atualizar-status-despesa-mensal'
import { cadastrarDespesaMensal } from './cadastrar-despesa-mensal'
import { deletarDespesaMensal } from './deletar-despesa-mensal'

export const despesasMensaisRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarDespesaMensal)
  app.register(atualizarDespesaMensal)
  app.register(atualizarStatusDespesaMensal)
  app.register(deletarDespesaMensal)
}
