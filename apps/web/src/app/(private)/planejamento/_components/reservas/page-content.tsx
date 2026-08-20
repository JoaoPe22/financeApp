'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useReservas } from '@/hooks/use-reservas'

import { ReservaFormDialog } from './reserva-form-dialog'
import { ReservaItem } from './reserva-item'

const PageContent = () => {
  const { data: reservas, isLoading } = useReservas()

  return (
    <Card className="w-full max-w-3xl rounded-xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Reservas</CardTitle>
        <ReservaFormDialog />
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}

        {!isLoading && reservas?.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhuma reserva cadastrada ainda.
          </p>
        )}

        {reservas?.map((reserva) => (
          <ReservaItem key={reserva.id} reserva={reserva} />
        ))}
      </CardContent>
    </Card>
  )
}

export { PageContent }
