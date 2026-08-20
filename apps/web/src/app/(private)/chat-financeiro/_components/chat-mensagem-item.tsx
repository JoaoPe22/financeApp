'use client'

import { CHAT_ROLE, ChatMensagem } from '@/types/chat-mensagem'

interface ChatMensagemItemProps {
  mensagem: ChatMensagem
  aguardandoResposta: boolean
}

const ChatMensagemItem = ({
  mensagem,
  aguardandoResposta,
}: ChatMensagemItemProps) => {
  const doUsuario = mensagem.role === CHAT_ROLE.USER

  return (
    <div className={`flex ${doUsuario ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
          doUsuario
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        {mensagem.conteudo || (aguardandoResposta ? '...' : '')}
      </div>
    </div>
  )
}

export { ChatMensagemItem }
