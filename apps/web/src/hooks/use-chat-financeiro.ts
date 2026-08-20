import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api-client'
import { env } from '@/lib/env'
import { extractErrorMessage } from '@/lib/error-handler'
import { CHAT_ROLE, ChatMensagem } from '@/types/chat-mensagem'

const ERRO_CONEXAO = 'Erro de conexão. Verifique sua internet e tente novamente.'

// Diverge de propósito do padrão useQuery/useMutation do resto do app:
// streaming exige estado manual (não há cache/invalidação envolvidos aqui).
// Usa fetch puro (não o apiClient/ky) pra ter acesso ao ReadableStream bruto
// da resposta, replicando manualmente o credentials: 'include' do apiClient.
const useChatFinanceiro = () => {
  const [mensagens, setMensagens] = useState<ChatMensagem[]>([])
  const [carregandoHistorico, setCarregandoHistorico] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [limpando, setLimpando] = useState(false)

  useEffect(() => {
    apiClient
      .get('chat-financeiro/mensagens')
      .json<{ mensagens: ChatMensagem[] }>()
      .then((data) => setMensagens(data.mensagens))
      .catch(async (error) => {
        toast.error(await extractErrorMessage(error))
      })
      .finally(() => setCarregandoHistorico(false))
  }, [])

  const enviarMensagem = async (texto: string) => {
    const idUsuario = crypto.randomUUID()
    const idAssistente = crypto.randomUUID()
    const agora = new Date().toISOString()

    setMensagens((prev) => [
      ...prev,
      { id: idUsuario, role: CHAT_ROLE.USER, conteudo: texto, createdAt: agora },
      { id: idAssistente, role: CHAT_ROLE.ASSISTANT, conteudo: '', createdAt: agora },
    ])
    setEnviando(true)

    const escreverNoAssistente = (conteudo: string) =>
      setMensagens((prev) =>
        prev.map((item) =>
          item.id === idAssistente ? { ...item, conteudo } : item))

    // Um evento SSE malformado não pode derrubar o stream inteiro
    const processarEvento = (evento: string) => {
      const linhaDeDados = evento
        .split('\n')
        .find((linha) => linha.startsWith('data:'))

      if (!linhaDeDados) return

      let payload: { delta?: string, error?: string, done?: boolean }

      try {
        payload = JSON.parse(linhaDeDados.replace(/^data:\s*/, ''))
      } catch {
        return
      }

      if (payload.error) {
        toast.error(payload.error)
        // O servidor persiste esse mesmo texto, então a bolha não fica vazia
        escreverNoAssistente(payload.error)
        return
      }

      if (payload.delta) {
        setMensagens((prev) =>
          prev.map((item) =>
            item.id === idAssistente
              ? { ...item, conteudo: item.conteudo + payload.delta }
              : item))
      }
    }

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/chat-financeiro/mensagens`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensagem: texto }),
        },
      )

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => null)
        toast.error(body?.message ?? 'Erro ao enviar mensagem.')
        // Nada foi persistido no servidor (a rota falhou antes do stream
        // começar) — remove a bolha vazia do assistente que ficaria pendurada.
        setMensagens((prev) => prev.filter((item) => item.id !== idAssistente))
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const eventos = buffer.split('\n\n')
        buffer = eventos.pop() ?? ''

        eventos.forEach(processarEvento)
      }

      // O último evento pode chegar sem o '\n\n' final e ficaria preso no buffer
      if (buffer.trim()) {
        processarEvento(buffer)
      }
    } catch {
      toast.error(ERRO_CONEXAO)
      escreverNoAssistente(ERRO_CONEXAO)
    } finally {
      setEnviando(false)
    }
  }

  const limparHistorico = async () => {
    setLimpando(true)

    try {
      await apiClient.delete('chat-financeiro/mensagens')
      setMensagens([])
      toast.success('Histórico apagado.')
    } catch (error) {
      toast.error(await extractErrorMessage(error))
    } finally {
      setLimpando(false)
    }
  }

  return {
    mensagens,
    carregandoHistorico,
    enviando,
    limpando,
    enviarMensagem,
    limparHistorico,
  }
}

export { useChatFinanceiro }
