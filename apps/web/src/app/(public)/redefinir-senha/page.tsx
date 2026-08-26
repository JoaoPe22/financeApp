import { Suspense } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { RedefinirSenhaForm } from './_components/redefinir-senha-form'

const Page = () => {
  return (
    <main className="grid min-h-screen w-full lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gray-300 lg:flex" />

      <section className="flex items-center justify-center bg-zinc-100 p-10">
        <Card className="w-80 max-w-md rounded-xl shadow-xl">
          <CardHeader className="space-y-6 text-center">
            {/* LOGO */}
          </CardHeader>

          <CardTitle className="text-center text-3xl">
            Redefinir senha
          </CardTitle>

          <CardContent>
            <Suspense fallback={null}>
              <RedefinirSenhaForm />
            </Suspense>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default Page
