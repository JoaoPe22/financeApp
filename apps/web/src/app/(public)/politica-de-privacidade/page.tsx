import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ATUALIZADO_EM = '25 de agosto de 2026'

const PoliticaDePrivacidadePage = () => {
  return (
    <main className="flex w-full justify-center p-6">
      <Card className="w-full max-w-2xl rounded-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Política de Privacidade</CardTitle>
          <p className="text-muted-foreground text-sm">
            Última atualização: {ATUALIZADO_EM}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 text-sm leading-relaxed">
          <p>
            Esta política explica quais dados o Finance App coleta, para que
            usa cada um deles e quais direitos você tem sobre eles, em
            conformidade com a Lei Geral de Proteção de Dados (Lei
            13.709/2018 — LGPD).
          </p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">
              1. Quais dados coletamos
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Cadastro:</strong> nome, e-mail e senha (armazenada
                com hash, nunca em texto puro).
              </li>
              <li>
                <strong>Perfil:</strong> data de nascimento, tipo e valor de
                renda, endereço (CEP, estado, cidade, bairro, logradouro,
                número e complemento) e, opcionalmente, uma foto de perfil.
              </li>
              <li>
                <strong>Dados financeiros:</strong> tudo que você cadastra no
                app para ele funcionar — categorias, despesas fixas e
                mensais, receitas, parcelamentos, investimentos, objetivos e
                reservas.
              </li>
              <li>
                <strong>Chat financeiro:</strong> as mensagens que você troca
                com o assistente de IA.
              </li>
              <li>
                <strong>Dados técnicos:</strong> endereço IP e navegador
                (user-agent) em ações sensíveis de autenticação (login,
                logout, redefinição de senha), para fins de segurança e
                auditoria.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">
              2. Por que coletamos e qual a base legal
            </h2>
            <p>
              Coletamos esses dados para fornecer o serviço que você pediu ao
              criar sua conta: organizar suas finanças pessoais, gerar
              relatórios e responder suas perguntas no chat financeiro. A
              base legal é a <strong>execução de contrato</strong> (art. 7º,
              V, LGPD) — sem esses dados o app simplesmente não funciona — e o{' '}
              <strong>consentimento</strong> que você dá ao criar a conta e
              aceitar esta política.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">
              3. Com quem compartilhamos
            </h2>
            <p>Não vendemos seus dados. Compartilhamos apenas com:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Google Gemini:</strong> quando você usa o chat
                financeiro, enviamos um resumo dos seus dados financeiros
                (saldo, despesas, receitas etc.) para a API do Gemini gerar a
                resposta. Isso só acontece se você usar o chat.
              </li>
              <li>
                <strong>Provedor de e-mail (SMTP):</strong> para enviar
                e-mails transacionais — confirmação de cadastro, redefinição
                de senha e avisos de segurança da sua conta.
              </li>
              <li>
                <strong>API pública de CEP/endereço:</strong> ao preencher seu
                endereço, o CEP é consultado num serviço público de geolocalização
                para sugerir estado e cidade.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">4. Cookies</h2>
            <p>
              Usamos apenas um cookie estritamente necessário: o de sessão de
              login. Não usamos cookies de rastreamento, publicidade ou
              analytics.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">
              5. Por quanto tempo guardamos seus dados
            </h2>
            <p>
              Enquanto sua conta existir. Se você excluir sua conta, todos os
              seus dados — perfil, despesas, receitas, parcelamentos,
              investimentos, objetivos, reservas e histórico do chat — são
              apagados permanentemente e de forma imediata.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">6. Seus direitos</h2>
            <p>Como titular dos dados, você pode a qualquer momento:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Acessar e corrigir seus dados diretamente no app.</li>
              <li>
                Exportar seus dados financeiros em CSV ou PDF na tela de
                Relatórios.
              </li>
              <li>
                Excluir sua conta e todos os dados vinculados a ela, na tela
                de Perfil.
              </li>
              <li>Revogar seu consentimento, o que implica excluir a conta.</li>
            </ul>
            <p>
              Para qualquer solicitação relacionada aos seus dados, entre em
              contato pelo e-mail{' '}
              <a
                href="mailto:nawan.sistemas@gmail.com"
                className="underline"
              >
                nawan.sistemas@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">7. Segurança</h2>
            <p>
              Senhas são armazenadas com hash, o tráfego é protegido por HTTPS
              e o acesso a cada dado financeiro é restrito ao próprio dono da
              conta. Em caso de incidente de segurança que afete seus dados,
              você será notificado pelo e-mail cadastrado.
            </p>
          </section>

          <p className="text-muted-foreground">
            Consulte também os{' '}
            <Link href="/termos-de-uso" className="underline">
              Termos de Uso
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export default PoliticaDePrivacidadePage
