'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useContasBancarias } from '@/hooks/use-contas-bancarias'

import { ContaBancariaFormDialog } from './conta-bancaria-form-dialog'
import { ContaBancariaItem } from './conta-bancaria-item'

const PageContent = () => {
  const { data: contasBancarias, isLoading } = useContasBancarias()

  return (
    <Card className="mx-auto w-full max-w-3xl rounded-xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Contas bancárias</CardTitle>
        <ContaBancariaFormDialog />
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}

        {!isLoading && contasBancarias?.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhuma conta cadastrada ainda. Cadastre a agência do seu cartão
            para poder lançar despesas no crédito.
          </p>
        )}

        {contasBancarias?.map((contaBancaria) => (
          <ContaBancariaItem
            key={contaBancaria.id}
            contaBancaria={contaBancaria}
          />
        ))}
      </CardContent>
    </Card>
  )
}

export { PageContent }
