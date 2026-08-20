import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'
import { Categoria, TipoCategoria } from '@/types/categoria'

interface CategoriaPayload {
  nome: string
  tipo: TipoCategoria
  cor: string
  icone: string
}

const useCategorias = (tipo?: TipoCategoria) =>
  useQuery({
    queryKey: ['categorias', tipo],
    queryFn: () =>
      apiClient
        .get('categorias', { searchParams: tipo ? { tipo } : undefined })
        .json<Categoria[]>(),
  })

const useSalvarCategoria = () => {
  const queryClient = useQueryClient()

  return useMutation<{ id: string }, Error, CategoriaPayload>({
    mutationFn: (data) => apiClient.post('categorias', { json: data }).json(),
    onSuccess: () => {
      toast.success('Categoria criada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useAtualizarCategoria = () => {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    Omit<CategoriaPayload, 'tipo'> & { id: string }
  >({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`categorias/${id}`, { json: data }).json(),
    onSuccess: () => {
      toast.success('Categoria atualizada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useDeletarCategoria = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete(`categorias/${id}`).json(),
    onSuccess: () => {
      toast.success('Categoria removida com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

export {
  useAtualizarCategoria,
  useCategorias,
  useDeletarCategoria,
  useSalvarCategoria,
}
