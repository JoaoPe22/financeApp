import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { authClient } from '@/auth/client'

const useSignOut = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const signOut = async () => {
    setIsSigningOut(true)
    try {
      await authClient.signOut()
      queryClient.clear()
      router.push('/sign-in')
      router.refresh()
    } catch (error) {
      console.error('Erro ao sair:', error)
      toast.error('Erro ao sair. Tente novamente.')
      setIsSigningOut(false)
    }
  }

  return { signOut, isSigningOut }
}

export { useSignOut }
