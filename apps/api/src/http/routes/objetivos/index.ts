import { FastifyInstance } from 'fastify'

import { atualizarObjetivo } from './atualizar-objetivo'
import { cadastrarObjetivo } from './cadastrar-objetivo'
import { deletarObjetivo } from './deletar-objetivo'
import { listarObjetivos } from './listar-objetivos'

export const objetivosRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarObjetivo)
  app.register(listarObjetivos)
  app.register(atualizarObjetivo)
  app.register(deletarObjetivo)
}
