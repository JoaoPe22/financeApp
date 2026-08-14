'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useParcelamentos } from '@/hooks/use-parcelamentos'

import { ParcelamentoFormDialog } from './parcelamento-form-dialog'
import { ParcelamentoItem } from './parcelamento-item'

const PageContent = () => {
  const { data: parcelamentos, isLoading } = useParcelamentos()

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
    </Card>
  )
}

export { PageContent }
