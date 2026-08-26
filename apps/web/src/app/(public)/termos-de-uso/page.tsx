import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ATUALIZADO_EM = '25 de agosto de 2026'

const TermosDeUsoPage = () => {
  return (
    <main className="flex w-full justify-center p-6">
      <Card className="w-full max-w-2xl rounded-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Termos de Uso</CardTitle>
          <p className="text-muted-foreground text-sm">
            Última atualização: {ATUALIZADO_EM}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold">1. Sobre o serviço</h2>
            <p>
              O Finance App é uma ferramenta de organização financeira
              pessoal: permite cadastrar despesas, receitas, parcelamentos,
              investimentos, objetivos e reservas, gerar relatórios e
              conversar com um assistente de IA sobre suas próprias
              finanças.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">
              2. Não é aconselhamento financeiro
            </h2>
            <p>
              As informações e respostas geradas pelo chat financeiro são
              apoio informativo baseado nos dados que você mesmo cadastrou.
              Elas não substituem a orientação de um profissional de
              finanças, contabilidade ou investimentos habilitado. Decisões
              financeiras tomadas com base no app são de sua inteira
              responsabilidade.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">3. Sua conta</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Você é responsável por manter sua senha em sigilo e por tudo
                que acontecer na sua conta.
              </li>
              <li>
                É necessário confirmar seu e-mail para usar a conta
                normalmente.
              </li>
              <li>
                Você pode excluir sua conta a qualquer momento na tela de
                Perfil — isso apaga permanentemente todos os seus dados.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">
              4. Exatidão dos dados
            </h2>
            <p>
              Os cálculos, saldos e relatórios do app dependem inteiramente
              dos dados que você cadastra. Não verificamos nem garantimos a
              exatidão de valores, datas ou categorias informados por você.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">5. Uso aceitável</h2>
            <p>
              Você concorda em não usar o app para fins ilícitos, não tentar
              acessar dados de outros usuários e não sobrecarregar ou
              interferir no funcionamento do serviço.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">
              6. Disponibilidade e mudanças
            </h2>
            <p>
              O serviço é fornecido &quot;como está&quot;, sem garantia de
              disponibilidade contínua. Funcionalidades podem ser alteradas,
              adicionadas ou removidas a qualquer momento. Mudanças
              relevantes nestes termos serão comunicadas atualizando a data
              no topo desta página.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">7. Seus dados</h2>
            <p>
              O tratamento dos seus dados pessoais está descrito na nossa{' '}
              <Link href="/politica-de-privacidade" className="underline">
                Política de Privacidade
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">8. Contato</h2>
            <p>
              Dúvidas sobre estes termos podem ser enviadas para{' '}
              <a
                href="mailto:nawan.sistemas@gmail.com"
                className="underline"
              >
                nawan.sistemas@gmail.com
              </a>
              .
            </p>
          </section>
        </CardContent>
      </Card>
    </main>
  )
}

export default TermosDeUsoPage
