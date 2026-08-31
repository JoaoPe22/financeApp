import { GoogleGenAI } from '@google/genai'
import { desc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { db } from '@/database'
import { chatMensagem, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'
import { montarSystemPrompt } from '@/lib/chat-financeiro-prompt'
import { agora } from '@/lib/dayjs'
import { env } from '@/lib/env'
import { montarResumoFinanceiro } from '@/lib/resumo-financeiro'

import { BadRequestError } from '../_errors/bad-request-error'
import { enviarMensagemBodySchema } from './schema'

const MODELO_GEMINI = 'gemini-2.5-flash'
const LIMITE_HISTORICO = 20
const ERRO_IA = 'Erro ao consultar a IA. Tente novamente.'

const enviarMensagem = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/chat-financeiro/mensagens',
    {
      preHandler: authenticate,
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      sse: true,
      schema: {
        tags: ['Chat Financeiro'],
        summary: 'Enviar mensagem ao chat financeiro',
        description:
          'Envia uma pergunta ao assistente de IA (Gemini) com o resumo financeiro do usuário como contexto, e transmite a resposta via SSE.',
        body: enviarMensagemBodySchema,
      },
    },
    async (request, reply) => {
      const { mensagem } = request.body
      const userId = request.user!.id

      if (!env.GEMINI_API_KEY) {
        throw new BadRequestError(
          'Não foi possível responder sua mensagem, por favor entre em contato com o suporte.',
        )
      }

      await db
        .insert(chatMensagem)
        .values({ userId, role: 'USER', conteudo: mensagem })

      const referencia = agora()
      const resumo = await montarResumoFinanceiro(
        userId,
        referencia.month() + 1,
        referencia.year(),
      )

      // As MAIS RECENTES (desc + limit), devolvidas em ordem cronológica. Com
      // asc + limit o contexto congelava nas primeiras 20 mensagens da conversa.
      const recentes = await db
        .select({ role: chatMensagem.role, conteudo: chatMensagem.conteudo })
        .from(chatMensagem)
        .where(eq(chatMensagem.userId, userId))
        .orderBy(desc(chatMensagem.createdAt))
        .limit(LIMITE_HISTORICO)

      // A mensagem recém-inserida é o "message" do sendMessageStream, então o
      // histórico do chat é tudo antes dela.
      const historico = recentes.reverse().slice(0, -1)

      // O Gemini exige que o histórico comece com 'user': ao cortar uma janela
      // no meio da conversa ela pode começar com uma resposta do assistente.
      const inicioValido = historico.findIndex((item) => item.role === 'USER')
      const historicoAnterior =
        inicioValido === -1 ? [] : historico.slice(inicioValido)

      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
      const chat = ai.chats.create({
        model: MODELO_GEMINI,
        config: { systemInstruction: montarSystemPrompt(resumo) },
        history: historicoAnterior.map((item) => ({
          role: item.role === 'ASSISTANT' ? 'model' : 'user',
          parts: [{ text: item.conteudo }],
        })),
      })

      let respostaCompleta = ''

      try {
        const stream = await chat.sendMessageStream({ message: mensagem })

        for await (const chunk of stream) {
          const texto = chunk.text
          if (!texto) continue

          respostaCompleta += texto
          await reply.sse.send({ data: { delta: texto } })
        }
      } catch (error) {
        console.error(error)
        await reply.sse.send({ data: { error: ERRO_IA } })
      }

      // Grava a resposta SEMPRE, inclusive quando o stream falhou. Sem isso a
      // mensagem do usuário ficava órfã no banco e o histórico da próxima
      // requisição teria dois 'user' seguidos — o Gemini rejeita, e o chat
      // quebrava em definitivo, sem recuperação nem recarregando a página.
      await db.insert(chatMensagem).values({
        userId,
        role: 'ASSISTANT',
        conteudo: respostaCompleta || ERRO_IA,
      })

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'chat_mensagem',
        entidadeId: userId,
        acao: 'CADASTRAR',
        descricao: 'Mensagem enviada ao chat financeiro',
      })

      await reply.sse.send({ data: { done: true } })
    },
  )
}

export { enviarMensagem }
