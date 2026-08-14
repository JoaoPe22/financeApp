'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/auth/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const signInSchema = z.object({
  email: z.email('Formato de e-mail inválido').min(1, 'O e-mail é obrigatório'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  rememberMe: z.boolean().optional(),
})

type SignInFormData = z.infer<typeof signInSchema>

const Page = () => {
  const router = useRouter()
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const handleLogin = async (data: SignInFormData) => {
    try {
      const response = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      })

      if (response.error) {
        console.error('Erro ao fazer login:', response.error)
        toast.error('Erro ao fazer login. Verifique suas credenciais.')
        return
      }

      toast.success('Login realizado com sucesso!')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      toast.error('Erro ao fazer login. Tente novamente.')
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

          <CardTitle className="text-center text-3xl">Login</CardTitle>

          <CardContent>
            <form onSubmit={handleSubmit(handleLogin)} method="post">
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

                  <Field>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      {...register('password')}
                      disabled={isSubmitting}
                    />
                    {errors.password && (
                      <span className="text-sm text-red-500 dark:text-red-700">
                        {errors.password.message}
                      </span>
                    )}
                  </Field>

                  <Field orientation="horizontal">
                    <Controller
                      name="rememberMe"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    <FieldLabel htmlFor="rememberMe">Lembrar-me</FieldLabel>
                  </Field>
                  {errors.rememberMe && (
                    <span>{errors.rememberMe.message}</span>
                  )}
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
                  Entrar
                </Button>

                <Link
                  href="/esqueci-senha"
                  className="text-muted-foreground block text-center text-sm hover:underline"
                  prefetch={false}
                >
                  Esqueci minha senha
                </Link>

                <Link
                  href="/sign-up"
                  className="text-muted-foreground block text-center text-sm hover:underline"
                  prefetch={false}
                >
                  Criar uma conta
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
