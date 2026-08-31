'use client'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDespesasFixas } from '@/hooks/use-despesas-fixas'

import { DespesaFixaFormDialog } from './despesa-fixa-form-dialog'
import { DespesaFixaItem } from './despesa-fixa-item'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const PageContent = () => {
  const { data: despesasFixas, isLoading } = useDespesasFixas()

  const totalAtivas = (despesasFixas ?? [])
    .filter((despesaFixa) => despesaFixa.ativa)
    .reduce((soma, despesaFixa) => soma + despesaFixa.valor, 0)

  return (
    <Card className="w-full max-w-3xl rounded-xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Despesas fixas</CardTitle>
        <DespesaFixaFormDialog />
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}

        {!isLoading && despesasFixas?.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhuma despesa fixa cadastrada ainda.
          </p>
        )}

        {despesasFixas?.map((despesaFixa) => (
          <DespesaFixaItem key={despesaFixa.id} despesaFixa={despesaFixa} />
        ))}
      </CardContent>

      {!isLoading && despesasFixas && despesasFixas.length > 0 && (
        <CardFooter className="border-t pt-4">
          <div>
            <p className="text-muted-foreground text-sm">
              Total das despesas fixas ativas
            </p>
            <p className="font-medium">
              {currencyFormatter.format(totalAtivas)}
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

export { PageContent }
