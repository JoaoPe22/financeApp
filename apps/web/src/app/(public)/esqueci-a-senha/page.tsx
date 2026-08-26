'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/auth/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const esqueciASenhaSchema = z.object({
  email: z
    .email('Formato de e-mail inválido')
    .min(1, 'O e-mail é obrigatório'),
})

type EsqueciASenhaFormData = z.infer<typeof esqueciASenhaSchema>

const Page = () => {
  const [enviado, setEnviado] = useState(false)
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
  } = useForm<EsqueciASenhaFormData>({
    resolver: zodResolver(esqueciASenhaSchema),
    defaultValues: { email: '' },
  })

  const handleEsqueciASenha = async (data: EsqueciASenhaFormData) => {
    try {
      await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: '/redefinir-senha',
      })
      // Resposta é sempre "sucesso" mesmo se o e-mail não existir — não
      // revela pra quem tenta se aquele e-mail tem conta ou não.
      setEnviado(true)
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error)
      toast.error('Erro ao enviar o e-mail. Tente novamente.')
    }
  }

  return (
    <main className="grid min-h-screen w-full lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gray-300 lg:flex" />

      <section className="flex items-center justify-center bg-zinc-100 p-10">
        <Card className="w-80 max-w-md rounded-xl shadow-xl">
          <CardHeader className="space-y-6 text-center">
            {/* LOGO */}
          </CardHeader>

          <CardTitle className="text-center text-3xl">
            Esqueci minha senha
          </CardTitle>

          <CardContent>
            {enviado
              ? (
                <div className="space-y-5 text-center">
                  <p className="text-muted-foreground text-sm">
                    Se esse e-mail tiver uma conta, enviamos um link pra
                    redefinir a senha.
                  </p>
                  <Link
                    href="/sign-in"
                    className="text-muted-foreground block text-center text-sm hover:underline"
                    prefetch={false}
                  >
                    Voltar para o login
                  </Link>
                </div>
                )
              : (
                <form
                  onSubmit={handleSubmit(handleEsqueciASenha)}
                  method="post"
                >
                  <FieldSet>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          disabled={isSubmitting}
                        />
                        {errors.email && <span>{errors.email.message}</span>}
                      </Field>
                    </FieldGroup>
                  </FieldSet>

                  <div className="space-y-5 pt-3">
                    <Button
                      className="w-full"
                      type="submit"
                      variant="secondary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="animate-spin" />}
                      Enviar link de redefinição
                    </Button>

                    <Link
                      href="/sign-in"
                      className="text-muted-foreground block text-center text-sm hover:underline"
                      prefetch={false}
                    >
                      Voltar para o login
                    </Link>
                  </div>
                </form>
                )}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default Page
