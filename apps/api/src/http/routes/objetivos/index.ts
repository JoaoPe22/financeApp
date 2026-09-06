import { FastifyInstance } from 'fastify'

import { atualizarObjetivo } from './atualizar-objetivo'
import { cadastrarObjetivo } from './cadastrar-objetivo'
import { deletarObjetivo } from './deletar-objetivo'
import { listarHistoricoObjetivo } from './listar-historico-objetivo'
import { listarObjetivos } from './listar-objetivos'
import { registrarHistoricoObjetivo } from './registrar-historico-objetivo'

export const objetivosRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarObjetivo)
  app.register(listarObjetivos)
  app.register(atualizarObjetivo)
  app.register(deletarObjetivo)
  app.register(listarHistoricoObjetivo)
  app.register(registrarHistoricoObjetivo)
}
