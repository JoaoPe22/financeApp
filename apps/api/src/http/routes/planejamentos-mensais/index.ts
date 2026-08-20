import { FastifyInstance } from 'fastify'

import { abrirPlanejamentoMensal } from './abrir-planejamento-mensal'
import { atualizarSalarioRecebido } from './atualizar-salario-recebido'
import { listarInsightsMensais } from './listar-insights-mensais'
import { listarPlanejamentoMensal } from './listar-planejamento-mensal'

export const planejamentosMensaisRoutes = async (app: FastifyInstance) => {
  app.register(abrirPlanejamentoMensal)
  app.register(listarPlanejamentoMensal)
  app.register(listarInsightsMensais)
  app.register(atualizarSalarioRecebido)
}
