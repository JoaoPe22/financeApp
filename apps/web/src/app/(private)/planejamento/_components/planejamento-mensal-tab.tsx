'use client'

import { ArrowDownAZ, ArrowUpAZ, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { MesAnoSelect } from '@/components/mes-ano-select'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useParcelamentos } from '@/hooks/use-parcelamentos'
import {
  useAbrirPlanejamentoMensal,
  usePlanejamentoMensal,
} from '@/hooks/use-planejamento-mensal'
import { FORMA_PAGAMENTO } from '@/types/conta-bancaria'
import {
  DespesaMensal,
  STATUS_DESPESA_MENSAL,
} from '@/types/planejamento-mensal'

import { DespesaMensalFormDialog } from './despesa-mensal-form-dialog'
import { DespesaMensalItem } from './despesa-mensal-item'
import { InsightsSection } from './insights-section'
import { ParcelaMensalItem } from './parcela-mensal-item'
import { ReceitaFormDialog } from './receita-form-dialog'
import { ReceitaItem } from './receita-item'
import { SalarioSection } from './salario-section'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const hoje = new Date()

const OPCOES_ORDENACAO = {
  dataVencimento: 'Vencimento',
  descricao: 'Nome',
  valor: 'Valor',
  tipo: 'Tipo',
  categoria: 'Categoria',
} as const

type CampoOrdenacao = keyof typeof OPCOES_ORDENACAO

const comparadores: Record<
  CampoOrdenacao,
  (a: DespesaMensal, b: DespesaMensal) => number
> = {
  dataVencimento: (a, b) => a.dataVencimento.localeCompare(b.dataVencimento),
  descricao: (a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR'),
  valor: (a, b) => a.valor - b.valor,
  tipo: (a, b) =>
    Number(a.despesaFixaId === null) - Number(b.despesaFixaId === null),
  categoria: (a, b) => a.categoriaNome.localeCompare(b.categoriaNome, 'pt-BR'),
}

interface ColunaProps {
  titulo: string
  total: number
  vazioTexto: string
  quantidade: number
  acao?: React.ReactNode
  // Receitas são poucas e ficam na largura toda — as demais colunas empilham
  corpoClassName?: string
  children: React.ReactNode
}

// Cada tipo de lançamento ganha sua própria coluna com rolagem independente —
// evita a página inteira virar um scroll único conforme o mês enche.
const Coluna = ({
  titulo,
  total,
  vazioTexto,
  quantidade,
  acao,
  corpoClassName = 'max-h-[60vh] space-y-3 overflow-y-auto',
  children,
}: ColunaProps) => (
  <section className="flex min-w-0 flex-col gap-3 rounded-lg border p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="font-medium">{titulo}</p>
        <p className="text-muted-foreground text-sm">
          {currencyFormatter.format(total)}
        </p>
      </div>
      {acao}
    </div>

    {quantidade === 0
      ? (
        <p className="text-muted-foreground text-sm">{vazioTexto}</p>
        )
      : (
        <div className={corpoClassName}>{children}</div>
        )}
  </section>
)

const PlanejamentoMensalTab = () => {
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [campoOrdenacao, setCampoOrdenacao] =
    useState<CampoOrdenacao>('dataVencimento')
  const [ordemDecrescente, setOrdemDecrescente] = useState(false)

  const { data, isLoading } = usePlanejamentoMensal(mes, ano)
  const { mutate: abrirPlanejamentoMensal, isPending: isAbrindo } =
    useAbrirPlanejamentoMensal(mes, ano)
  const { data: parcelamentos } = useParcelamentos()

  const parcelasPagasPorParcelamento = new Map(
    parcelamentos?.map((item) => [item.id, item.parcelasPagas]),
  )

  const planejamento = data?.planejamento ?? null
  const despesas = [...(data?.despesas ?? [])].sort((a, b) => {
    const resultado = comparadores[campoOrdenacao](a, b)
    return ordemDecrescente ? -resultado : resultado
  })
  const receitas = data?.receitas ?? []
  const parcelas = data?.parcelas ?? []

  // As despesas pagas no crédito saem da coluna de despesas e ganham a sua
  // própria — os totais do rodapé continuam somando as duas.
  const despesasCredito = despesas.filter(
    (despesa) => despesa.formaPagamento === FORMA_PAGAMENTO.CREDITO,
  )
  const despesasComuns = despesas.filter(
    (despesa) => despesa.formaPagamento !== FORMA_PAGAMENTO.CREDITO,
  )
  const totalCredito = despesasCredito.reduce(
    (soma, despesa) => soma + despesa.valor,
    0,
  )

  const totalDespesas = despesas.reduce(
    (soma, despesa) => soma + despesa.valor,
    0,
  )
  const totalParcelas = parcelas.reduce(
    (soma, parcela) => soma + parcela.valor,
    0,
  )
  const totalPago =
    despesas
      .filter((despesa) => despesa.status === STATUS_DESPESA_MENSAL.PAGA)
      .reduce((soma, despesa) => soma + despesa.valor, 0) +
    parcelas
      .filter((parcela) => parcela.status === STATUS_DESPESA_MENSAL.PAGA)
      .reduce((soma, parcela) => soma + parcela.valor, 0)
  const totalReceitas = receitas.reduce(
    (soma, receita) => soma + receita.valorLiquido,
    0,
  )
  const totalGasto = totalDespesas + totalParcelas
  const saldo =
    (planejamento?.salarioRecebido ?? planejamento?.salarioPrevisto ?? 0) +
    totalReceitas -
    totalDespesas -
    totalParcelas

  return (
    <Card className="w-full rounded-xl shadow-xl">
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-2xl">Planejamento mensal</CardTitle>
        <MesAnoSelect
          mes={mes}
          ano={ano}
          onChangeMes={setMes}
          onChangeAno={setAno}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        <InsightsSection mes={mes} ano={ano} />

        {isLoading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}

        {!isLoading && !planejamento && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-muted-foreground text-sm">
              Este mês ainda não foi aberto.
            </p>
            <Button
              type="button"
              disabled={isAbrindo}
              onClick={() => abrirPlanejamentoMensal()}
            >
              {isAbrindo && <Loader2 className="animate-spin" />}
              Puxar despesas fixas
            </Button>
          </div>
        )}

        {planejamento && (
          <>
            <SalarioSection
              key={planejamento.id}
              planejamento={planejamento}
              mes={mes}
              ano={ano}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                Ordenar despesas por
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={campoOrdenacao}
                  onValueChange={(value) =>
                    setCampoOrdenacao(value as CampoOrdenacao)}
                >
                  <SelectTrigger size="sm" className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(OPCOES_ORDENACAO).map(([valor, label]) => (
                      <SelectItem key={valor} value={valor}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOrdemDecrescente((atual) => !atual)}
                >
                  {ordemDecrescente ? <ArrowDownAZ /> : <ArrowUpAZ />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isAbrindo}
                  onClick={() => abrirPlanejamentoMensal()}
                >
                  {isAbrindo && <Loader2 className="animate-spin" />}
                  Puxar despesas fixas
                </Button>
              </div>
            </div>

            <Coluna
              titulo="Receitas"
              total={totalReceitas}
              quantidade={receitas.length}
              vazioTexto="Nenhuma receita além do salário neste mês."
              corpoClassName="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              acao={
                <ReceitaFormDialog
                  planejamentoMensalId={planejamento.id}
                  mes={mes}
                  ano={ano}
                />
              }
            >
              {receitas.map((receita) => (
                <ReceitaItem
                  key={receita.id}
                  receita={receita}
                  planejamentoMensalId={planejamento.id}
                  mes={mes}
                  ano={ano}
                />
              ))}
            </Coluna>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Coluna
                titulo="Despesas do mês"
                total={totalDespesas - totalCredito}
                quantidade={despesasComuns.length}
                vazioTexto="Nenhuma despesa neste mês ainda."
                acao={
                  <DespesaMensalFormDialog
                    planejamentoMensalId={planejamento.id}
                    mes={mes}
                    ano={ano}
                  />
                }
              >
                {despesasComuns.map((despesa) => (
                  <DespesaMensalItem
                    key={despesa.id}
                    despesaMensal={despesa}
                    planejamentoMensalId={planejamento.id}
                    mes={mes}
                    ano={ano}
                  />
                ))}
              </Coluna>

              <Coluna
                titulo="Parcelamentos"
                total={totalParcelas}
                quantidade={parcelas.length}
                vazioTexto="Nenhuma parcela cai neste mês."
              >
                {parcelas.map((parcela) => (
                  <ParcelaMensalItem
                    key={parcela.id}
                    parcela={parcela}
                    parcelasPagas={
                      parcelasPagasPorParcelamento.get(
                        parcela.parcelamentoId,
                      ) ?? 0
                    }
                  />
                ))}
              </Coluna>

              <Coluna
                titulo="Cartão de crédito"
                total={totalCredito}
                quantidade={despesasCredito.length}
                vazioTexto="Nenhuma despesa no crédito neste mês."
              >
                {despesasCredito.map((despesa) => (
                  <DespesaMensalItem
                    key={despesa.id}
                    despesaMensal={despesa}
                    planejamentoMensalId={planejamento.id}
                    mes={mes}
                    ano={ano}
                  />
                ))}
              </Coluna>
            </div>
          </>
        )}
      </CardContent>

      {planejamento && (
        <CardFooter className="flex flex-wrap gap-6 border-t pt-4">
          <div>
            <p className="text-muted-foreground text-sm">Total gasto no mês</p>
            <p className="font-medium">
              {currencyFormatter.format(totalGasto)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total de receitas</p>
            <p className="text-chart-2 font-medium">
              +{currencyFormatter.format(totalReceitas)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total de despesas</p>
            <p className="font-medium">
              {currencyFormatter.format(totalDespesas)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total de parcelas</p>
            <p className="font-medium">
              {currencyFormatter.format(totalParcelas)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total pago</p>
            <p className="font-medium">{currencyFormatter.format(totalPago)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Saldo</p>
            <p
              className={`font-medium ${saldo < 0 ? 'text-destructive' : 'text-chart-2'}`}
            >
              {currencyFormatter.format(saldo)}
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

export { PlanejamentoMensalTab }
