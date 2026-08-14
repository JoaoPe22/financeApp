'use client'

import { Loader2, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSignOut } from '@/hooks/use-sign-out'

const SignOutButton = () => {
  const { signOut, isSigningOut } = useSignOut()

  return (
    <Button variant="destructive" onClick={signOut} disabled={isSigningOut}>
      {isSigningOut ? <Loader2 className="animate-spin" /> : <LogOut />}
      Sair
    </Button>
  )
}

export { SignOutButton }
