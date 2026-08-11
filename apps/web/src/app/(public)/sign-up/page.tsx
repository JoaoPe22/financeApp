'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/auth/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

// Nome vira obrigatório aqui (diferente do login) porque é campo do cadastro
const signUpSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.email('Formato de e-mail inválido').min(1, 'O e-mail é obrigatório'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
})

type SignUpFormData = z.infer<typeof signUpSchema>

const Page = () => {
  const router = useRouter()
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      // Cria o usuário no banco e já autentica (better-auth define o cookie de sessão)
      const response = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      })

      if (response.error) {
        console.error('Erro ao criar conta:', response.error)
        toast.error(response.error.message || 'Erro ao criar conta. Tente novamente.')
        return
      }

      toast.success('Conta criada com sucesso!')
      router.push('/perfil')
      router.refresh()
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      toast.error('Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <main className="grid w-full min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gray-300 lg:flex" />

      <section className="flex items-center justify-center bg-zinc-100 p-10">
        <Card className="w-80 max-w-md rounded-xl shadow-xl">
          <CardHeader className="space-y-6 text-center">
            {/* LOGO */}
          </CardHeader>

          <CardTitle className="text-center text-3xl">Criar conta</CardTitle>

          <CardContent>
            <form onSubmit={handleSubmit(handleSignUp)} method="post">
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nome</FieldLabel>
                    <Input id="name" {...register('name')} disabled={isSubmitting} />
                    {errors.name && <span>{errors.name.message}</span>}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" type="email" {...register('email')} disabled={isSubmitting} />
                    {errors.email && <span>{errors.email.message}</span>}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <Input id="password" type="password" {...register('password')} disabled={isSubmitting} />
                    {errors.password && <span>{errors.password.message}</span>}
                  </Field>
                </FieldGroup>
              </FieldSet>

              <div className="space-y-5 pt-3">
                <Button
                  className="w-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  Criar conta
                </Button>

                <Link
                  href="/sign-in"
                  className="text-muted-foreground block text-center text-sm hover:underline"
                  prefetch={false}
                >
                  Já tenho uma conta
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default Page
