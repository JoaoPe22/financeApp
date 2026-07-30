import { authClient } from '@/auth/client'
import type {
  BanUserInput,
  CreateUserInput,
  ListUsersParams,
  ListUsersResponse,
  SetPasswordInput,
  SetRoleInput,
  UpdateUserInput,
  User,
} from '@/types/usuario'

const throwIfError = (error: { message?: string } | null) => {
  if (error) throw new Error(error.message || 'Erro inesperado')
}

const usuariosService = {
  list: async (params?: ListUsersParams): Promise<ListUsersResponse> => {
    const { data, error } = await authClient.admin.listUsers({
      query: params ?? {},
    })
    throwIfError(error)
    return data as ListUsersResponse
  },

  create: async (input: CreateUserInput): Promise<User> => {
    const { data, error } = await authClient.admin.createUser(input)
    throwIfError(error)
    return (data as { user: User }).user
  },

  update: async ({ userId, data }: UpdateUserInput): Promise<User> => {
    const { data: result, error } = await authClient.admin.updateUser({
      userId,
      data,
    })
    throwIfError(error)
    return result as User
  },

  delete: async (userId: string): Promise<void> => {
    const { error } = await authClient.admin.removeUser({ userId })
    throwIfError(error)
  },

  ban: async (data: BanUserInput): Promise<void> => {
    const { error } = await authClient.admin.banUser(data)
    throwIfError(error)
  },

  unban: async (userId: string): Promise<void> => {
    const { error } = await authClient.admin.unbanUser({ userId })
    throwIfError(error)
  },

  setRole: async (data: SetRoleInput): Promise<void> => {
    const { error } = await authClient.admin.setRole(data)
    throwIfError(error)
  },

  setPassword: async (data: SetPasswordInput): Promise<void> => {
    const { error } = await authClient.admin.setUserPassword(data)
    throwIfError(error)
  },

  requestPasswordReset: async (userId: string): Promise<void> => {
    const { data: userData, error: userError } = await authClient.admin.getUser(
      { query: { id: userId } },
    )
    throwIfError(userError)

    const user = (userData as { user: User } | null)?.user
    if (!user) throw new Error('Usuário não encontrado')

    const { error } = await authClient.requestPasswordReset({
      email: user.email,
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    throwIfError(error)
  },
}

export { usuariosService }
