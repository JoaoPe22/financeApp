import { FastifyInstance } from 'fastify'

import { atualizarContaBancaria } from './atualizar-conta-bancaria'
import { cadastrarContaBancaria } from './cadastrar-conta-bancaria'
import { deletarContaBancaria } from './deletar-conta-bancaria'
import { listarContasBancarias } from './listar-contas-bancarias'

export const contasBancariasRoutes = async (app: FastifyInstance) => {
  app.register(cadastrarContaBancaria)
  app.register(listarContasBancarias)
  app.register(atualizarContaBancaria)
  app.register(deletarContaBancaria)
}
