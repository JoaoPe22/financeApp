'use client'

import { Loader2, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useChatFinanceiro } from '@/hooks/use-chat-financeiro'

import { ChatMensagemItem } from './chat-mensagem-item'

const PageContent = () => {
  const { mensagens, carregandoHistorico, enviando, enviarMensagem } =
    useChatFinanceiro()
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

  return (
    <Card className="flex h-[80vh] w-full max-w-3xl flex-col rounded-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Chat financeiro</CardTitle>
        <p className="text-muted-foreground text-sm">
          Análise de apoio à decisão — não substitui aconselhamento financeiro
          profissional.
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto">
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
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleEnviar()
              }
            }}
            placeholder="Digite sua pergunta..."
            disabled={enviando}
          />
          <Button
            type="button"
            onClick={handleEnviar}
            disabled={enviando || !texto.trim()}
          >
            {enviando ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export { PageContent }
