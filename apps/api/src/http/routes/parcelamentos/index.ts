import { FastifyInstance } from 'fastify'

import { atualizarParcelamento } from './atualizar-parcelamento'
import { cadastrarParcelamento } from './cadastrar-parcelamento'
import { deletarParcelamento } from './deletar-parcelamento'
import { desfazerParcelasPagas } from './desfazer-parcelas-pagas'
import { listarParcelamentos } from './listar-parcelamentos'
import { listarParcelas } from './listar-parcelas'
import { marcarParcelaPaga } from './marcar-parcela-paga'
import { marcarParcelasPagas } from './marcar-parcelas-pagas'

export const parcelamentosRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarParcelamento)
  app.register(listarParcelamentos)
  app.register(listarParcelas)
  app.register(marcarParcelasPagas)
  app.register(marcarParcelaPaga)
  app.register(desfazerParcelasPagas)
  app.register(atualizarParcelamento)
  app.register(deletarParcelamento)
}
