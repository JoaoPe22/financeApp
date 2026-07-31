// Define as roles do plugin admin do better-auth (usado tanto pela API quanto pelo
// Next.js — veja apps/web/src/auth/index.ts e client.ts, que importam este arquivo).
// Hoje as 3 roles têm exatamente as mesmas permissões (skeleton genérico de RBAC);
// a distinção fica só no nome, pronta para diferenciar permissões no futuro.
import { createAccessControl } from 'better-auth/plugins'
import { adminAc, defaultStatements } from 'better-auth/plugins/organization/access'

const statement = {
  ...defaultStatements,
} as const

const ac = createAccessControl(statement)

const AUXILIAR = ac.newRole({
  ...adminAc.statements,
})

const SUPERVISOR = ac.newRole({
  ...adminAc.statements,
})

const ADMIN = ac.newRole({
  ...adminAc.statements,
})

type UserRole = 'ADMIN' | 'SUPERVISOR' | 'AUXILIAR'

export { ac, ADMIN, AUXILIAR, statement, SUPERVISOR }
export type { UserRole }
