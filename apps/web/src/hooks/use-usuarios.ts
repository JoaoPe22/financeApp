// Hook de gerenciamento de usuários do sistema
// Responsabilidades:
//   - Prover lista paginada de usuários com filtros via React Query
//   - Mutações de criação, atualização, exclusão, banimento/desbanimento, troca de função e senha
//   - Atualização otimista do cache e rollback automático; operações de senha/reset sem otimismo

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'

import { extractErrorMessage } from '@/lib/error-handler'
import { usuariosService } from '@/services/usuarios'
import type { BanUserInput, CreateUserInput, ListUsersParams, ListUsersResponse, SetPasswordInput, SetRoleInput, UpdateUserInput, User } from '@/types/usuario'

type UserContext = {
  previousUsers: [readonly unknown[], ListUsersResponse | User | undefined][];
}

const useUsuarios = () => {
  const queryClient = useQueryClient()

  const list = (
    params?: ListUsersParams,
    options?: Omit<UseQueryOptions<ListUsersResponse>, 'queryKey' | 'queryFn'>,
  ) =>
    useQuery<ListUsersResponse>({
      queryKey: ['usuarios', params],
      queryFn: () => usuariosService.list(params),
      ...options,
    })

  // Padrão repetido em todas as mutações abaixo: onMutate atualiza a lista na tela
  // ANTES da API responder (otimista) e guarda o estado anterior; onError desfaz
  // essa mudança se a API falhar; onSettled sempre revalida com o servidor no final.
  const create = useMutation<User, Error, CreateUserInput, UserContext>({
    mutationFn: usuariosService.create,
    async onMutate(newUser) {
      await queryClient.cancelQueries({ queryKey: ['usuarios'] })

      const previousUsers = queryClient.getQueriesData<
        ListUsersResponse | User
      >({ queryKey: ['usuarios'] })

      queryClient.setQueriesData<ListUsersResponse>(
        { queryKey: ['usuarios'] },
        (old) => {
          if (!old) return old
          const tempId = `temp-${Date.now()}`
          const optimisticUser: User = {
            id: tempId,
            name: newUser.name,
            email: newUser.email,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            role: newUser.role,
          }
          return {
            ...old,
            users: [optimisticUser, ...old.users],
            total: old.total + 1,
          }
        },
      )

      return { previousUsers }
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuário criado com sucesso!')
    },
    async onError(error, variables, context) {
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as readonly unknown[], data)
        })
      }
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })

  const update = useMutation<User, Error, UpdateUserInput, UserContext>({
    mutationFn: usuariosService.update,
    async onMutate(variables) {
      await queryClient.cancelQueries({ queryKey: ['usuarios'] })

      const previousUsers = queryClient.getQueriesData<
        ListUsersResponse | User
      >({ queryKey: ['usuarios'] })

      queryClient.setQueriesData<ListUsersResponse>(
        { queryKey: ['usuarios'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            users: old.users.map((user) =>
              user.id === variables.userId
                ? { ...user, ...variables.data, updatedAt: new Date() }
                : user,
            ),
          }
        },
      )

      return { previousUsers }
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuário atualizado com sucesso!')
    },
    async onError(error, variables, context) {
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as readonly unknown[], data)
        })
      }
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })

  const remove = useMutation<void, Error, string, UserContext>({
    mutationFn: usuariosService.delete,
    async onMutate(userId) {
      await queryClient.cancelQueries({ queryKey: ['usuarios'] })

      const previousUsers = queryClient.getQueriesData<
        ListUsersResponse | User
      >({ queryKey: ['usuarios'] })

      queryClient.setQueriesData<ListUsersResponse>(
        { queryKey: ['usuarios'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            users: old.users.filter((user) => user.id !== userId),
            total: old.total - 1,
          }
        },
      )

      return { previousUsers }
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuário excluído com sucesso!')
    },
    async onError(error, variables, context) {
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as readonly unknown[], data)
        })
      }
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })

  const ban = useMutation<void, Error, BanUserInput, UserContext>({
    mutationFn: usuariosService.ban,
    async onMutate(variables) {
      await queryClient.cancelQueries({ queryKey: ['usuarios'] })

      const previousUsers = queryClient.getQueriesData<
        ListUsersResponse | User
      >({ queryKey: ['usuarios'] })

      queryClient.setQueriesData<ListUsersResponse>(
        { queryKey: ['usuarios'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            users: old.users.map((user) =>
              user.id === variables.userId
                ? {
                    ...user,
                    banned: true,
                    banReason: variables.banReason || null,
                    banExpires: variables.banExpiresIn
                      ? new Date(Date.now() + variables.banExpiresIn)
                      : null,
                    updatedAt: new Date(),
                  }
                : user,
            ),
          }
        },
      )

      return { previousUsers }
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuário banido com sucesso!')
    },
    async onError(error, variables, context) {
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as readonly unknown[], data)
        })
      }
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })

  const unban = useMutation<void, Error, string, UserContext>({
    mutationFn: usuariosService.unban,
    async onMutate(userId) {
      await queryClient.cancelQueries({ queryKey: ['usuarios'] })

      const previousUsers = queryClient.getQueriesData<
        ListUsersResponse | User
      >({ queryKey: ['usuarios'] })

      queryClient.setQueriesData<ListUsersResponse>(
        { queryKey: ['usuarios'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            users: old.users.map((user) =>
              user.id === userId
                ? {
                    ...user,
                    banned: false,
                    banReason: null,
                    banExpires: null,
                    updatedAt: new Date(),
                  }
                : user,
            ),
          }
        },
      )

      return { previousUsers }
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuário desbanido com sucesso!')
    },
    async onError(error, variables, context) {
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as readonly unknown[], data)
        })
      }
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })

  const setRole = useMutation<void, Error, SetRoleInput, UserContext>({
    mutationFn: usuariosService.setRole,
    async onMutate(variables) {
      await queryClient.cancelQueries({ queryKey: ['usuarios'] })

      const previousUsers = queryClient.getQueriesData<
        ListUsersResponse | User
      >({ queryKey: ['usuarios'] })

      queryClient.setQueriesData<ListUsersResponse>(
        { queryKey: ['usuarios'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            users: old.users.map((user) =>
              user.id === variables.userId
                ? { ...user, role: variables.role, updatedAt: new Date() }
                : user,
            ),
          }
        },
      )

      return { previousUsers }
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Função do usuário alterada com sucesso!')
    },
    async onError(error, variables, context) {
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as readonly unknown[], data)
        })
      }
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })

  const setPassword = useMutation<void, Error, SetPasswordInput>({
    mutationFn: usuariosService.setPassword,
    onSuccess() {
      toast.success('Senha alterada com sucesso!')
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })

  const requestPasswordReset = useMutation<void, Error, string>({
    mutationFn: usuariosService.requestPasswordReset,
    onSuccess() {
      toast.success('Email de redefinição de senha enviado!')
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })

  return {
    list,
    create,
    update,
    remove,
    ban,
    unban,
    setRole,
    setPassword,
    requestPasswordReset,
  }
}

export { useUsuarios }
