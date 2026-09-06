'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useObjetivos } from '@/hooks/use-objetivos'

import { ObjetivoFormDialog } from './objetivo-form-dialog'
import { ObjetivoItem } from './objetivo-item'

const PageContent = () => {
  const { data: objetivos, isLoading } = useObjetivos()

  return (
    <Card className="mx-auto w-full max-w-3xl rounded-xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Objetivos</CardTitle>
        <ObjetivoFormDialog />
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}

        {!isLoading && objetivos?.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhum objetivo cadastrado ainda.
          </p>
        )}

        {objetivos?.map((objetivo) => (
          <ObjetivoItem key={objetivo.id} objetivo={objetivo} />
        ))}
      </CardContent>
    </Card>
  )
}

export { PageContent }
