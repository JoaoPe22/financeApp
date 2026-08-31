'use client'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useParcelamentos } from '@/hooks/use-parcelamentos'
import { usePlanejamentoMensal } from '@/hooks/use-planejamento-mensal'

import { ParcelamentoFormDialog } from './parcelamento-form-dialog'
import { ParcelamentoItem } from './parcelamento-item'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const hoje = new Date()

const PageContent = () => {
  const { data: parcelamentos, isLoading } = useParcelamentos()
  // Cada parcela já nasce vinculada ao planejamento_mensal do mês em que
  // vence — reaproveita a mesma rota da aba Mensal pra pegar só as do mês
  // atual, sem precisar somar datas de vencimento no client.
  const { data: planejamentoMesAtual } = usePlanejamentoMensal(
    hoje.getMonth() + 1,
    hoje.getFullYear(),
  )

  const totalIntegral = (parcelamentos ?? []).reduce(
    (soma, item) => soma + (item.valorTotal - item.valorPago),
    0,
  )
  const totalMesAtual = (planejamentoMesAtual?.parcelas ?? []).reduce(
    (soma, parcela) => soma + parcela.valor,
    0,
  )

  return (
    <Card className="w-full max-w-3xl rounded-xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Parcelamentos</CardTitle>
        <ParcelamentoFormDialog />
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        )}

        {!isLoading && parcelamentos?.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhum parcelamento cadastrado ainda.
          </p>
        )}

        {parcelamentos?.map((parcelamento) => (
          <ParcelamentoItem key={parcelamento.id} parcelamento={parcelamento} />
        ))}
      </CardContent>

      {!isLoading && parcelamentos && parcelamentos.length > 0 && (
        <CardFooter className="flex flex-wrap gap-6 border-t pt-4">
          <div>
            <p className="text-muted-foreground text-sm">
              Valor integral restante
            </p>
            <p className="font-medium">
              {currencyFormatter.format(totalIntegral)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Parcelas do mês</p>
            <p className="font-medium">
              {currencyFormatter.format(totalMesAtual)}
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

export { PageContent }
