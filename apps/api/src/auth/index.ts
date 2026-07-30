import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware } from 'better-auth/api'
import { admin } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'

import { db } from '@/database'
import { user as userTable } from '@/database/schema/'
import { formatDateTimeBR } from '@/lib/dayjs'
import { env } from '@/lib/env'
import { sendEmail } from '@/lib/mail'
import {
  resetPasswordTemplate,
  resetPasswordTextTemplate,
} from '@/lib/mail-template'
import { registrarLogUsuario } from '@/lib/user-log-helper'

import { ac, ADMIN, AUXILIAR, SUPERVISOR } from './permissions'

const buscarUsuario = async (userId: string) => {
  const [usuario] = await db
    .select({ id: userTable.id, name: userTable.name, email: userTable.email })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1)

  return usuario
}

const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseUrl: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      const resetUrl = url.replace(
        `${env.BETTER_AUTH_URL}/reset-password`,
        `${env.FRONTEND_URL}/redefinir-senha?token`
      )
      await registrarLogUsuario({
        acao: `Solicitação de redefinição de senha - ${user.name} (${user.email})`,
        usuarioAfetadoId: user.id,
        usuarioAfetadoEmail: user.email,
        detalhes: 'Usuário solicitou redefinição de senha via formulário',
      })

      sendEmail({
        to: user.email,
        subject: 'Redefinição de Senha - Projeto SaaS',
        html: resetPasswordTemplate({
          userName: user.name,
          resetUrl,
          expiresIn: '1 hora',
        }),
        text: resetPasswordTextTemplate({
          userName: user.name,
          resetUrl,
          expiresIn: '1 hora',
        }),
      })
    },
    onPasswordReset: async ({ user }) => {
      await registrarLogUsuario({
        acao: `Senha redefinida com sucesso - ${user.name} (${user.email})`,
        usuarioAfetadoId: user.id,
        usuarioAfetadoEmail: user.email,
        detalhes: 'Usuário completou o processo de redefinição de senha',
      })

      sendEmail({
        to: user.email,
        subject: 'Senha Alterada - Projeto SaaS',
        html: `
        <p>Olá ${user.name},</p>
        <p>Sua senha foi alterada com sucesso em ${formatDateTimeBR(new Date())}.</p>
        <p>Se você não realizou esta alteração, entre em contato conosco imediatamente.</p>
      `,
        text: `Sua senha foi alterada com sucesso em ${formatDateTimeBR(new Date())}.`,
      })
    },
  },
  plugins: [
    admin({
      defaultRole: 'AUXILIAR',
      ac,
      roles: { ADMIN, SUPERVISOR, AUXILIAR },
    }),
  ],

  trustedOrigins: [env.BETTER_AUTH_URL, env.FRONTEND_URL],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const ipAddress = ctx.headers?.['x-forwarded-for'] as string | undefined
      const userAgent = ctx.headers?.['user-agent'] as string | undefined

      // Login bem-sucedido
      if (ctx.path === '/sign-in/email' && ctx.context.newSession) {
        const user = ctx.context.newSession.user

        await registrarLogUsuario({
          acao: `Login realizado - ${user.name} (${user.email})`,
          usuarioAfetadoId: user.id,
          usuarioAfetadoEmail: user.email,
          detalhes: `Usuário autenticado com sucesso | IP: ${ipAddress || 'Não disponível'}`,
          ipAddress,
          userAgent,
        })
      }

      // Logout
      if (ctx.path === '/sign-out' && ctx.context.session?.user) {
        const user = ctx.context.session.user

        await registrarLogUsuario({
          acao: `Logout - ${user.name} (${user.email})`,
          usuarioAfetadoId: user.id,
          usuarioAfetadoEmail: user.email,
          detalhes: 'Usuário encerrou a sessão',
          ipAddress,
          userAgent,
        })
      }

      // Rotas de admin
      if (ctx.path?.startsWith('/admin/')) {
        const user = ctx.context.session?.user

        if (ctx.path === '/admin/ban-user') {
          const body = ctx.body as {
            userId: string
            banReason?: string
            banExpiresIn?: number
          }

          const usuarioAfetado = await buscarUsuario(body.userId)

          if (usuarioAfetado) {
            const motivoTexto = body.banReason || 'Sem motivo especificado'
            const expiraTexto = body.banExpiresIn
              ? ` | Expira em: ${Math.floor(body.banExpiresIn / 60)} minutos`
              : ' | Banimento permanente'

            await registrarLogUsuario({
              acao: `Usuário banido: ${usuarioAfetado.name}`,
              usuarioAfetadoId: body.userId,
              usuarioExecutorId: user?.id,
              usuarioExecutorEmail: user?.email,
              detalhes: `Motivo: ${motivoTexto}${expiraTexto} | Email: ${usuarioAfetado.email}`,
              ipAddress,
              userAgent,
            })
          }
        }

        if (ctx.path === '/admin/unban-user') {
          const body = ctx.body as { userId: string }
          const usuarioAfetado = await buscarUsuario(body.userId)

          if (usuarioAfetado) {
            await registrarLogUsuario({
              acao: `Usuário desbanido: ${usuarioAfetado.name}`,
              usuarioAfetadoId: body.userId,
              usuarioExecutorId: user?.id,
              usuarioExecutorEmail: user?.email,
              detalhes: `Email: ${usuarioAfetado.email} | Banimento removido`,
              ipAddress,
              userAgent,
            })
          }
        }

        if (ctx.path === '/admin/set-role') {
          const body = ctx.body as { userId: string; role: string | string[] }
          const roleStr = Array.isArray(body.role)
            ? body.role.join(', ')
            : body.role

          const usuarioAfetado = await buscarUsuario(body.userId)

          if (usuarioAfetado) {
            await registrarLogUsuario({
              acao: `Alteração de permissão: ${usuarioAfetado.name}`,
              usuarioAfetadoId: body.userId,
              usuarioExecutorId: user?.id,
              usuarioExecutorEmail: user?.email,
              detalhes: `Nova role: ${roleStr} | Email: ${usuarioAfetado.email}`,
              ipAddress,
              userAgent,
            })
          }
        }

        if (ctx.path === '/admin/create-user') {
          const bodyRequest = ctx.body as {
            name: string
            email: string
            role?: string
          }
          const returned = ctx.context.returned as {
            id: string
            email: string
            name: string
          } | null

          if (returned) {
            const roleTexto = bodyRequest.role || 'AUXILIAR'
            await registrarLogUsuario({
              acao: `Novo usuário criado: ${returned.name}`,
              usuarioAfetadoId: returned.id,
              usuarioAfetadoEmail: returned.email,
              usuarioExecutorId: user?.id,
              usuarioExecutorEmail: user?.email,
              detalhes: `Email: ${returned.email} | Role inicial: ${roleTexto}`,
              ipAddress,
              userAgent,
            })
          }
        }

        if (ctx.path === '/admin/update-user') {
          const body = ctx.body as {
            userId: string
            data: Record<string, unknown>
          }

          const usuarioAfetado = await buscarUsuario(body.userId)

          if (usuarioAfetado) {
            const camposAlterados = Object.keys(body.data)
            const camposTexto = camposAlterados
              .map((campo) => {
                const valor = body.data[campo]
                if (campo === 'name') return `Nome: ${valor}`
                if (campo === 'email') return `Email: ${valor}`
                return campo
              })
              .join(', ')

            await registrarLogUsuario({
              acao: `Dados atualizados: ${usuarioAfetado.name}`,
              usuarioAfetadoId: body.userId,
              usuarioExecutorId: user?.id,
              usuarioExecutorEmail: user?.email,
              detalhes: `Campos alterados: ${camposTexto} | Email: ${usuarioAfetado.email}`,
              ipAddress,
              userAgent,
            })
          }
        }

        if (ctx.path === '/admin/set-user-password') {
          const body = ctx.body as { userId: string }
          const usuarioAfetado = await buscarUsuario(body.userId)

          if (usuarioAfetado) {
            await registrarLogUsuario({
              acao: `Senha redefinida por admin: ${usuarioAfetado.name}`,
              usuarioAfetadoId: body.userId,
              usuarioExecutorId: user?.id,
              usuarioExecutorEmail: user?.email,
              detalhes: `Administrador redefiniu a senha | Email: ${usuarioAfetado.email}`,
              ipAddress,
              userAgent,
            })
          }
        }

        if (ctx.path === '/admin/remove-user') {
          const body = ctx.body as { userId: string }
          const usuarioAfetado = await buscarUsuario(body.userId)

          if (usuarioAfetado) {
            await registrarLogUsuario({
              acao: `Usuário removido do sistema: ${usuarioAfetado.name}`,
              usuarioAfetadoId: body.userId,
              usuarioExecutorId: user?.id,
              usuarioExecutorEmail: user?.email,
              detalhes: `Email: ${usuarioAfetado.email} | Conta deletada permanentemente`,
              ipAddress,
              userAgent,
            })
          }
        }

        if (ctx.path === '/admin/impersonate-user') {
          const body = ctx.body as { userId: string }
          const usuarioAfetado = await buscarUsuario(body.userId)

          if (usuarioAfetado) {
            await registrarLogUsuario({
              acao: `Impersonação iniciada: ${usuarioAfetado.name}`,
              usuarioAfetadoId: body.userId,
              usuarioExecutorId: user?.id,
              usuarioExecutorEmail: user?.email,
              detalhes: `Admin assumiu identidade | Email: ${usuarioAfetado.email}`,
              ipAddress,
              userAgent,
            })
          }
        }

        if (ctx.path === '/admin/stop-impersonating') {
          await registrarLogUsuario({
            acao: 'Impersonação encerrada',
            usuarioExecutorId: user?.id,
            usuarioExecutorEmail: user?.email,
            detalhes: 'Admin retornou à sua própria identidade',
            ipAddress,
            userAgent,
          })
        }
      }
    }),
  },
})

export { auth }
