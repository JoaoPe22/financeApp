// Sistema de auditoria e logging de ações de usuários
// Responsabilidades:
// - Registrar ações executadas por usuários no sistema
// - Capturar metadados de requisições HTTP (IP, User-Agent)
// - Manter rastreabilidade de alterações para compliance e segurança

import type { FastifyRequest } from 'fastify'

import { db } from '@/database'
import { logsUsuarios } from '@/database/schema/'

// Tipo que define os parâmetros para registro de log de usuário
type LogUsuarioParams = {
  acao: string // Descrição da ação executada (ex: "login", "criou cliente")
  usuarioAfetadoId?: string // ID do usuário que foi afetado pela ação (opcional)
  usuarioAfetadoEmail?: string // Email do usuário que foi afetado (opcional)
  usuarioExecutorId?: string // ID do usuário que executou a ação (opcional)
  usuarioExecutorEmail?: string // Email do usuário que executou a ação (opcional)
  detalhes?: string // Informações adicionais sobre a ação (opcional)
  ipAddress?: string // Endereço IP de origem da requisição (opcional)
  userAgent?: string // User-Agent do navegador/cliente (opcional)
}

// Registra uma ação de usuário no banco de dados para auditoria
//
// Parâmetros:
// @param params - Objeto contendo dados da ação a ser registrada
//
// Retorna: Promise<void>
//
// Fluxo:
// 1. Insere registro na tabela logsUsuarios
// 2. Em caso de erro, loga no console mas não interrompe execução
//
// Observações:
// - Nunca lança exceções para não interromper fluxo principal
// - Erros são apenas logados para debug
// - Usado para compliance, auditoria e investigação de incidentes
const registrarLogUsuario = async (params: LogUsuarioParams) => {
  try {
    // Insere log no banco de dados
    await db.insert(logsUsuarios).values({
      acao: params.acao,
      usuarioAfetadoId: params.usuarioAfetadoId,
      usuarioAfetadoEmail: params.usuarioAfetadoEmail,
      usuarioExecutorId: params.usuarioExecutorId,
      usuarioExecutorEmail: params.usuarioExecutorEmail,
      detalhes: params.detalhes,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  } catch (error) {
    // Loga erro sem interromper aplicação
    // Falhas de logging não devem afetar funcionalidade principal
    console.error('Erro ao registrar log de usuário:', error)
  }
}

// Extrai informações úteis de uma requisição Fastify para logging
//
// Parâmetros:
// @param request - Objeto de requisição Fastify (opcional)
//
// Retorna: Objeto contendo IP e User-Agent, ou undefined para ambos se request não fornecido
//
// Uso: Capturar metadados antes de registrar log
//
// Exemplo:
// const { ipAddress, userAgent } = extrairInfoRequest(request)
// await registrarLogUsuario({ acao: 'login', ipAddress, userAgent, ... })
const extrairInfoRequest = (request?: FastifyRequest) => {
  // Se não houver request, retorna undefined para os campos
  if (!request) {
    return {
      ipAddress: undefined,
      userAgent: undefined,
    }
  }

  // Extrai IP e User-Agent da requisição
  return {
    ipAddress: request.ip, // IP do cliente (considera proxies/load balancers)
    userAgent: request.headers['user-agent'], // String identificadora do navegador/cliente
  }
}

export { registrarLogUsuario, extrairInfoRequest }
export type { LogUsuarioParams }
