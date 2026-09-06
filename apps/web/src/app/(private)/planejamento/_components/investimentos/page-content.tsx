'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useInvestimentos } from '@/hooks/use-investimentos'

import { InvestimentoFormDialog } from './investimento-form-dialog'
import { InvestimentoItem } from './investimento-item'

const PageContent = () => {
  const { data: investimentos, isLoading } = useInvestimentos()

  return (
    <Card className="mx-auto w-full max-w-3xl rounded-xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Investimentos</CardTitle>
        <InvestimentoFormDialog />
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}

        {!isLoading && investimentos?.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhum investimento cadastrado ainda.
          </p>
        )}

        {investimentos?.map((investimento) => (
          <InvestimentoItem key={investimento.id} investimento={investimento} />
        ))}
      </CardContent>
    </Card>
  )
}

export { PageContent }
