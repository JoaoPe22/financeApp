'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAbrirPlanejamentoMensal,
  usePlanejamentoMensal,
} from '@/hooks/use-planejamento-mensal'
import { STATUS_DESPESA_MENSAL } from '@/types/planejamento-mensal'

import { DespesaMensalFormDialog } from './despesa-mensal-form-dialog'
import { DespesaMensalItem } from './despesa-mensal-item'
import { InsightsSection } from './insights-section'
import { MesAnoSelect } from './mes-ano-select'
import { ParcelaMensalItem } from './parcela-mensal-item'
import { ReceitaFormDialog } from './receita-form-dialog'
import { ReceitaItem } from './receita-item'
import { SalarioSection } from './salario-section'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const hoje = new Date()

const PageContent = () => {
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())

  const { data, isLoading } = usePlanejamentoMensal(mes, ano)
  const { mutate: abrirPlanejamentoMensal, isPending: isAbrindo } =
    useAbrirPlanejamentoMensal(mes, ano)

  const planejamento = data?.planejamento ?? null
  const despesas = data?.despesas ?? []
  const receitas = data?.receitas ?? []
  const parcelas = data?.parcelas ?? []

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
  const saldo =
    (planejamento?.salarioRecebido ?? planejamento?.salarioPrevisto ?? 0) +
    totalReceitas -
    totalDespesas -
    totalParcelas

  return (
    <Card className="w-full max-w-3xl rounded-xl shadow-xl">
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
            <SalarioSection planejamento={planejamento} mes={mes} ano={ano} />

            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Outras receitas do mês</p>
              <ReceitaFormDialog
                planejamentoMensalId={planejamento.id}
                mes={mes}
                ano={ano}
              />
            </div>

            {receitas.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Nenhuma receita além do salário neste mês.
              </p>
            )}

            <div className="space-y-3">
              {receitas.map((receita) => (
                <ReceitaItem
                  key={receita.id}
                  receita={receita}
                  planejamentoMensalId={planejamento.id}
                  mes={mes}
                  ano={ano}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Despesas do mês</p>
              <div className="flex items-center gap-2">
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
                <DespesaMensalFormDialog
                  planejamentoMensalId={planejamento.id}
                  mes={mes}
                  ano={ano}
                />
              </div>
            </div>

            {despesas.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Nenhuma despesa neste mês ainda.
              </p>
            )}

            <div className="space-y-3">
              {despesas.map((despesa) => (
                <DespesaMensalItem
                  key={despesa.id}
                  despesaMensal={despesa}
                  planejamentoMensalId={planejamento.id}
                  mes={mes}
                  ano={ano}
                />
              ))}
            </div>

            {parcelas.length > 0 && (
              <>
                <p className="text-muted-foreground text-sm">
                  Parcelamentos do mês
                </p>

                <div className="space-y-3">
                  {parcelas.map((parcela) => (
                    <ParcelaMensalItem key={parcela.id} parcela={parcela} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>

      {planejamento && (
        <CardFooter className="flex flex-wrap gap-6 border-t pt-4">
          <div>
            <p className="text-muted-foreground text-sm">Total de receitas</p>
            <p className="font-medium">
              {currencyFormatter.format(totalReceitas)}
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
            <p className={`font-medium ${saldo < 0 ? 'text-destructive' : ''}`}>
              {currencyFormatter.format(saldo)}
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

export { PageContent }
