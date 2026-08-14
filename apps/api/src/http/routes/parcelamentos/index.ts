import { FastifyInstance } from 'fastify'

import { cadastrarParcelamento } from './cadastrar-parcelamento'
import { deletarParcelamento } from './deletar-parcelamento'
import { listarParcelamentos } from './listar-parcelamentos'
import { listarParcelas } from './listar-parcelas'
import { marcarParcelasPagas } from './marcar-parcelas-pagas'

export const parcelamentosRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarParcelamento)
  app.register(listarParcelamentos)
  app.register(listarParcelas)
  app.register(marcarParcelasPagas)
  app.register(deletarParcelamento)
}
