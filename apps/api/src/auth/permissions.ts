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
