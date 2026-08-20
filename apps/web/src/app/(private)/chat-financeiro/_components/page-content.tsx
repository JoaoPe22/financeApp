'use client'

import { Loader2, Send, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useChatFinanceiro } from '@/hooks/use-chat-financeiro'

import { ChatMensagemItem } from './chat-mensagem-item'

const PageContent = () => {
  const {
    mensagens,
    carregandoHistorico,
    enviando,
    limpando,
    enviarMensagem,
    limparHistorico,
  } = useChatFinanceiro()
  const [texto, setTexto] = useState('')
  const fimDaListaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  const handleEnviar = () => {
    const mensagem = texto.trim()
    if (!mensagem || enviando) return

    setTexto('')
    enviarMensagem(mensagem)
  }

  // ponytail: confirm() nativo — o projeto não tem wrapper de AlertDialog e
  // isso é uma ação destrutiva rara. Trocar por Dialog se virar padrão no app.
  const handleLimpar = () => {
    if (!window.confirm('Apagar todo o histórico do chat? Isso não pode ser desfeito.')) {
      return
    }

    limparHistorico()
  }

  return (
    <Card className="flex h-[80vh] w-full max-w-3xl flex-col rounded-xl shadow-xl">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-2xl">Chat financeiro</CardTitle>
          <p className="text-muted-foreground text-sm">
            Análise de apoio à decisão — não substitui aconselhamento financeiro
            profissional.
          </p>
        </div>

        {mensagens.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleLimpar}
            disabled={limpando || enviando}
            aria-label="Limpar histórico do chat"
          >
            {limpando ? <Loader2 className="animate-spin" /> : <Trash2 />}
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div
          className="flex-1 space-y-3 overflow-y-auto"
          aria-live="polite"
          aria-busy={enviando}
        >
          {carregandoHistorico && (
            <>
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="ml-auto h-10 w-2/3" />
            </>
          )}

          {!carregandoHistorico && mensagens.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Pergunte algo como &quot;se eu comprar uma TV de R$ 2.000 parcelada,
              qual o impacto nas minhas finanças?&quot;
            </p>
          )}

          {mensagens.map((mensagem, index) => (
            <ChatMensagemItem
              key={mensagem.id}
              mensagem={mensagem}
              aguardandoResposta={enviando && index === mensagens.length - 1}
            />
          ))}

          <div ref={fimDaListaRef} />
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleEnviar()
              }
            }}
            placeholder="Digite sua pergunta..."
            disabled={enviando}
            aria-label="Sua pergunta"
          />
          <Button
            type="button"
            onClick={handleEnviar}
            disabled={enviando || !texto.trim()}
            aria-label="Enviar pergunta"
          >
            {enviando ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export { PageContent }
