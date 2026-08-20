import { FastifyInstance } from 'fastify'

import { atualizarReserva } from './atualizar-reserva'
import { cadastrarReserva } from './cadastrar-reserva'
import { deletarReserva } from './deletar-reserva'
import { listarReservas } from './listar-reservas'

export const reservasRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarReserva)
  app.register(listarReservas)
  app.register(atualizarReserva)
  app.register(deletarReserva)
}
