// Agrupa todas as rotas relacionadas a usuários registradas em src/http/server.ts
import { FastifyInstance } from 'fastify'

import { listarLogsUsuarios } from './listar-logs-usuarios'
import { obterUsuarios } from './obter-usuarios'

const usuariosRoutes = async (app: FastifyInstance) => {
  app.register(listarLogsUsuarios)
  app.register(obterUsuarios)
}

export { usuariosRoutes }
