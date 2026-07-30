import { createAccessControl } from 'better-auth/plugins/access'
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access'

export const statement = {
  ...defaultStatements,
  clientePessoaFisica: ['create', 'read', 'update', 'delete', 'export'],
  clientePessoaJuridica: ['create', 'read', 'update', 'delete', 'export'],
  licencaPessoaFisica: ['create', 'read', 'update', 'delete', 'renovar'],
  licencaPessoaJuridica: ['create', 'read', 'update', 'delete', 'renovar'],
  historicoPessoaFisica: ['create', 'read', 'update', 'delete'],
  historicoPessoaJuridica: ['create', 'read', 'update', 'delete'],
  comodato: ['create', 'read', 'update', 'delete'],
  contato: ['create', 'read', 'update', 'delete'],
  requerimento: ['create', 'read', 'update', 'delete'],
  vertice: ['create', 'read', 'update', 'delete'],
  visita: ['create', 'read', 'update', 'delete'],
  evento: ['create', 'read', 'update', 'delete'],
  relatorio: ['view', 'export', 'create'],
  tarefa: ['create', 'read', 'update', 'delete', 'updateClosed', 'viewAll'],
} as const

export const ac = createAccessControl(statement)

export const AUXILIAR = ac.newRole({
  ...adminAc.statements,
  clientePessoaFisica: ['create', 'read', 'update', 'delete', 'export'],
  clientePessoaJuridica: ['create', 'read', 'update', 'delete', 'export'],
  licencaPessoaFisica: ['create', 'read', 'update', 'delete', 'renovar'],
  licencaPessoaJuridica: ['create', 'read', 'update', 'delete', 'renovar'],
  historicoPessoaFisica: ['create', 'read', 'update', 'delete'],
  historicoPessoaJuridica: ['create', 'read', 'update', 'delete'],
  comodato: ['create', 'read', 'update', 'delete'],
  contato: ['create', 'read', 'update', 'delete'],
  requerimento: ['create', 'read', 'update', 'delete'],
  vertice: ['create', 'read', 'update', 'delete'],
  visita: ['create', 'read', 'update', 'delete'],
  evento: ['create', 'read', 'update', 'delete'],
  relatorio: ['view', 'export', 'create'],
  tarefa: ['create', 'read', 'update', 'delete'],
})

export const SUPERVISOR = ac.newRole({
  ...adminAc.statements,
  clientePessoaFisica: ['create', 'read', 'update', 'delete', 'export'],
  clientePessoaJuridica: ['create', 'read', 'update', 'delete', 'export'],
  licencaPessoaFisica: ['create', 'read', 'update', 'delete', 'renovar'],
  licencaPessoaJuridica: ['create', 'read', 'update', 'delete', 'renovar'],
  historicoPessoaFisica: ['create', 'read', 'update', 'delete'],
  historicoPessoaJuridica: ['create', 'read', 'update', 'delete'],
  comodato: ['create', 'read', 'update', 'delete'],
  contato: ['create', 'read', 'update', 'delete'],
  requerimento: ['create', 'read', 'update', 'delete'],
  vertice: ['create', 'read', 'update', 'delete'],
  visita: ['create', 'read', 'update', 'delete'],
  evento: ['create', 'read', 'update', 'delete'],
  relatorio: ['view', 'export', 'create'],
  tarefa: ['create', 'read', 'update', 'delete', 'updateClosed', 'viewAll'],
})

export const ADMIN = ac.newRole({
  ...adminAc.statements,
  clientePessoaFisica: ['create', 'read', 'update', 'delete', 'export'],
  clientePessoaJuridica: ['create', 'read', 'update', 'delete', 'export'],
  licencaPessoaFisica: ['create', 'read', 'update', 'delete', 'renovar'],
  licencaPessoaJuridica: ['create', 'read', 'update', 'delete', 'renovar'],
  historicoPessoaFisica: ['create', 'read', 'update', 'delete'],
  historicoPessoaJuridica: ['create', 'read', 'update', 'delete'],
  comodato: ['create', 'read', 'update', 'delete'],
  contato: ['create', 'read', 'update', 'delete'],
  requerimento: ['create', 'read', 'update', 'delete'],
  vertice: ['create', 'read', 'update', 'delete'],
  visita: ['create', 'read', 'update', 'delete'],
  evento: ['create', 'read', 'update', 'delete'],
  relatorio: ['view', 'export', 'create'],
  tarefa: ['create', 'read', 'update', 'delete', 'updateClosed', 'viewAll'],
})

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'AUXILIAR'
