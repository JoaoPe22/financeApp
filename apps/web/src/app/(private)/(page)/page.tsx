// Home / página de conta (rota privada "/").
// Só é alcançada se o middleware (src/proxy.ts) confirmar que existe sessão válida.
// Busca os dados do usuário logado com o hook authClient.useSession() (client-side,
// lê o cookie de sessão) e permite encerrar a sessão pelo botão "Desvincular da conta".
'use client'

import { Loader2, LogOut } from 'lucide-react'

import { authClient } from '@/auth/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSignOut } from '@/hooks/use-sign-out'

const Home = () => {
  // isPending: true enquanto a sessão ainda está sendo lida do cookie
  const { data, isPending } = authClient.useSession()
  const { signOut, isSigningOut } = useSignOut()

  return (
    <main className="flex min-h-screen items-center justify-center p-10">
      <Card className="w-80 max-w-md rounded-xl shadow-xl">
        <CardHeader className="space-y-6 text-center" />

        <CardTitle className="text-center text-3xl">Minha conta</CardTitle>

        <CardContent className="space-y-5">
          {isPending
            ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin" />
              </div>
              )
            : (
              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-sm">Nome</p>
                  <p className="font-medium">{data?.user.name}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">Email</p>
                  <p className="font-medium">{data?.user.email}</p>
                </div>
              </div>
              )}

          <Button
            className="w-full"
            variant="destructive"
            onClick={signOut}
            disabled={isSigningOut}
          >
            {isSigningOut
              ? <Loader2 className="animate-spin" />
              : <LogOut />}
            Sair
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

export default Home
