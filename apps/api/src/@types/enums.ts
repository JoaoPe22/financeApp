import z from 'zod'

const roleEnum = z.enum(['ADMIN', 'SUPERVISOR', 'AUXILIAR'])
type Role = z.infer<typeof roleEnum>

export { roleEnum }

export type { Role }
