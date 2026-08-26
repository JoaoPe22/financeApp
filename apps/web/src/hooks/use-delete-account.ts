import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { authClient } from '@/auth/client'

const useDeleteAccount = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteAccount = async (password: string) => {
    setIsDeleting(true)
    try {
      const response = await authClient.deleteUser({ password })

      if (response.error) {
        toast.error(response.error.message || 'Senha incorreta.')
        setIsDeleting(false)
        return
      }

      queryClient.clear()
      toast.success('Conta excluída com sucesso.')
      router.push('/sign-up')
      router.refresh()
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
      toast.error('Erro ao excluir conta. Tente novamente.')
      setIsDeleting(false)
    }
  }

  return { deleteAccount, isDeleting }
}

export { useDeleteAccount }
