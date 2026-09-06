import { FastifyInstance } from 'fastify'

import { atualizarReserva } from './atualizar-reserva'
import { cadastrarReserva } from './cadastrar-reserva'
import { deletarReserva } from './deletar-reserva'
import { listarHistoricoReserva } from './listar-historico-reserva'
import { listarReservas } from './listar-reservas'
import { registrarHistoricoReserva } from './registrar-historico-reserva'

export const reservasRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarReserva)
  app.register(listarReservas)
  app.register(atualizarReserva)
  app.register(deletarReserva)
  app.register(listarHistoricoReserva)
  app.register(registrarHistoricoReserva)
}
