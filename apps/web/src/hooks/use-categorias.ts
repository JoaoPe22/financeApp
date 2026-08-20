import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'
import { Categoria, TipoCategoria } from '@/types/categoria'

// Padrão repetido em quase todo hook de src/hooks (use-despesas-fixas,
// use-investimentos, use-objetivos, use-reservas, use-perfil...): useQuery
// pra leitura, useMutation + queryClient.invalidateQueries pra escrita (o
// invalidate força o useQuery a rebuscar e refletir a mudança na tela), toast
// pra feedback e extractErrorMessage (src/lib/error-handler.ts) pra
// transformar o erro do ky numa mensagem legível. Documentado aqui uma única
// vez — os demais hooks de CRUD não repetem o comentário.

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
