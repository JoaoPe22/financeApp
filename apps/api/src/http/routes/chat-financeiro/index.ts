import { FastifyInstance } from 'fastify'

import { enviarMensagem } from './enviar-mensagem'
import { listarMensagens } from './listar-mensagens'

export const chatFinanceiroRoutes = async (app: FastifyInstance) => {
  app.register(enviarMensagem)
  app.register(listarMensagens)
}
