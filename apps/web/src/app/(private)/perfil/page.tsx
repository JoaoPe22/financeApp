import { Card, CardContent, CardTitle } from '@/components/ui/card'

import { AvatarUploader } from './_components/avatar-uploader'
import { PageContent } from './_components/page-content'
import { SignOutButton } from './_components/sign-out-button'

const PerfilPage = () => {
  return (
    <main className="flex flex-col items-center gap-4 p-10">
      <AvatarUploader />

      <PageContent />

      <Card className="w-full max-w-2xl rounded-xl shadow-xl">
        <CardTitle className="px-6 text-xl">Configurações</CardTitle>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Em breve novas configurações estarão disponíveis por aqui.
          </p>
          <SignOutButton />
        </CardContent>
      </Card>
    </main>
  )
}

export default PerfilPage
