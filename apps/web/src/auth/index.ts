import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware } from 'better-auth/api'
import { admin } from 'better-auth/plugins'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { v7 as uuidv7 } from 'uuid'

import { ac, ADMIN, AUXILIAR, SUPERVISOR } from '@/projeto-saas/api/src/auth/permissions'

import { envServer } from '../lib/env-server'
import { sendEmail } from '../lib/mail'
import { resetPasswordTemplate, resetPasswordTextTemplate } from '../lib/mail-templates'
import * as authSchema from './schema'

declare global {
  var _bsyPool: Pool | undefined
}

// ponytail: globalThis guard prevents HMR from leaking pg.Pool instances (each holds 10 idle connections)
const pool = (globalThis._bsyPool ??= new Pool({
  connectionString: envServer.DATABASE_URL,
}))
const db = drizzle(pool, { schema: authSchema, casing: 'camelCase' })

type LogParams = {
  acao: string;
  usuarioAfetadoId?: string;
  usuarioAfetadoEmail?: string;
  usuarioExecutorId?: string;
  usuarioExecutorEmail?: string;
  detalhes?: string;
  ipAddress?: string;
  userAgent?: string;
}

const logUsuario = async (params: LogParams) => {
  try {
    // logs_usuarios foi substituída pela tabela "log" centralizada (ver api/src/db/schema/log.ts)
    const descricao = [
      params.acao,
      params.usuarioAfetadoEmail &&
        `Usuário afetado: ${params.usuarioAfetadoEmail}`,
      params.usuarioExecutorEmail && `Executor: ${params.usuarioExecutorEmail}`,
      params.ipAddress && `IP: ${params.ipAddress}`,
      params.userAgent && `User-Agent: ${params.userAgent}`,
      params.detalhes && `Detalhes: ${params.detalhes}`,
    ]
      .filter(Boolean)
      .join('\n')

    await pool.query(
      `INSERT INTO "log" (id, entidade, "entidadeId", "usuarioId", acao, descricao)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        uuidv7(),
        'usuarios',
        params.usuarioAfetadoId ?? params.usuarioExecutorId ?? 'sistema',
        params.usuarioExecutorId ?? null,
        'AUTENTICACAO',
        descricao,
      ],
    )
  } catch (error) {
    console.error('Erro ao registrar log de usuário:', error)
  }
}

const buscarUsuario = async (userId: string) => {
  const { rows } = await pool.query<{
    id: string;
    name: string;
    email: string;
  }>('SELECT id, name, email FROM "user" WHERE id = $1 LIMIT 1', [userId])
  return rows[0]
}

const auth = betterAuth({
  secret: envServer.BETTER_AUTH_SECRET,
  baseURL: envServer.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      const resetUrl = url.replace(
        `${envServer.BETTER_AUTH_URL}/reset-password`,
        `${envServer.BETTER_AUTH_URL}/redefinir-senha?token`,
      )

      await logUsuario({
        acao: `Solicitação de redefinição de senha - ${user.name} (${user.email})`,
        usuarioAfetadoId: user.id,
        usuarioAfetadoEmail: user.email,
        detalhes: 'Usuário solicitou redefinição de senha via formulário',
      })

      sendEmail({
        to: user.email,
        subject: 'Redefinição de Senha - BSY Consultoria',
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
      await logUsuario({
        acao: `Senha redefinida com sucesso - ${user.name} (${user.email})`,
        usuarioAfetadoId: user.id,
        usuarioAfetadoEmail: user.email,
        detalhes: 'Usuário completou o processo de redefinição de senha',
      })

      sendEmail({
        to: user.email,
        subject: 'Senha Alterada - BSY Consultoria',
        html: `<p>Olá ${user.name},</p><p>Sua senha foi alterada com sucesso em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' })}.</p><p>Se você não realizou esta alteração, entre em contato conosco imediatamente.</p>`,
        text: `Sua senha foi alterada com sucesso em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' })}.`,
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
  rateLimit: {
    enabled: true,
    storage: 'memory',
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/email': { window: 60, max: 10 },
      '/forget-password': { window: 60, max: 5 },
    },
  },
  advanced: {
    trustedProxyHeaders: true,
    crossSubDomainCookies: {
      enabled: !!envServer.BETTER_AUTH_CROSS_SUBDOMAIN_COOKIES_URL,
      domain: envServer.BETTER_AUTH_CROSS_SUBDOMAIN_COOKIES_URL,
    },
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // @ts-expect-error - Headers podem ser undefined, então precisamos fazer uma verificação de tipo
      const ipAddress = ctx.headers?.['x-forwarded-for'] as string | undefined
      // @ts-expect-error - Headers podem ser undefined, então precisamos fazer uma verificação de tipo
      const userAgent = ctx.headers?.['user-agent'] as string | undefined

      if (ctx.path === '/sign-in/email' && ctx.context.newSession) {
        const user = ctx.context.newSession.user
        await logUsuario({
          acao: `Login realizado - ${user.name} (${user.email})`,
          usuarioAfetadoId: user.id,
          usuarioAfetadoEmail: user.email,
          detalhes: `Usuário autenticado com sucesso | IP: ${ipAddress || 'Não disponível'}`,
          ipAddress,
          userAgent,
        })
      }

      if (ctx.path === '/sign-out' && ctx.context.session?.user) {
        const user = ctx.context.session.user
        await logUsuario({
          acao: `Logout - ${user.name} (${user.email})`,
          usuarioAfetadoId: user.id,
          usuarioAfetadoEmail: user.email,
          detalhes: 'Usuário encerrou a sessão',
          ipAddress,
          userAgent,
        })
      }

      if (ctx.path?.startsWith('/admin/')) {
        const user = ctx.context.session?.user

        if (ctx.path === '/admin/ban-user') {
          const body = ctx.body as {
            userId: string;
            banReason?: string;
            banExpiresIn?: number;
          }
          const usuarioAfetado = await buscarUsuario(body.userId)
          if (usuarioAfetado) {
            const motivoTexto = body.banReason || 'Sem motivo especificado'
            const expiraTexto = body.banExpiresIn
              ? ` | Expira em: ${Math.floor(body.banExpiresIn / 60)} minutos`
              : ' | Banimento permanente'
            await logUsuario({
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
            await logUsuario({
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
            await logUsuario({
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
            name: string;
            email: string;
            role?: string;
          }
          const returned = ctx.context.returned as {
            id: string;
            email: string;
            name: string;
          } | null
          if (returned) {
            await logUsuario({
              acao: `Novo usuário criado: ${returned.name}`,
              usuarioAfetadoId: returned.id,
              usuarioAfetadoEmail: returned.email,
              usuarioExecutorId: user?.id,
              usuarioExecutorEmail: user?.email,
              detalhes: `Email: ${returned.email} | Role inicial: ${bodyRequest.role || 'AUXILIAR'}`,
              ipAddress,
              userAgent,
            })
          }
        }

        if (ctx.path === '/admin/update-user') {
          const body = ctx.body as {
            userId: string;
            data: Record<string, unknown>;
          }
          const usuarioAfetado = await buscarUsuario(body.userId)
          if (usuarioAfetado) {
            const camposTexto = Object.keys(body.data)
              .map((campo) => {
                const valor = body.data[campo]
                if (campo === 'name') return `Nome: ${valor}`
                if (campo === 'email') return `Email: ${valor}`
                return campo
              })
              .join(', ')
            await logUsuario({
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
            await logUsuario({
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
            await logUsuario({
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
            await logUsuario({
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
          await logUsuario({
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

export { auth, pool }
