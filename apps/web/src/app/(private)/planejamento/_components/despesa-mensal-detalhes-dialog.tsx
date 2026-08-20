'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DespesaMensal,
  STATUS_DESPESA_MENSAL,
} from '@/types/planejamento-mensal'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const STATUS_LABEL: Record<string, string> = {
  [STATUS_DESPESA_MENSAL.PENDENTE]: 'Pendente',
  [STATUS_DESPESA_MENSAL.PAGA]: 'Paga',
  [STATUS_DESPESA_MENSAL.ATRASADA]: 'Atrasada',
}

const formatarData = (data: string) =>
  new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')

interface DespesaMensalDetalhesDialogProps {
  despesaMensal: DespesaMensal
  children: React.ReactNode
}

const DespesaMensalDetalhesDialog = ({
  despesaMensal,
  children,
}: DespesaMensalDetalhesDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{despesaMensal.descricao}</DialogTitle>
        </DialogHeader>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Categoria</dt>
            <dd className="flex items-center gap-2 font-medium">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: despesaMensal.categoriaCor }}
              />
              {despesaMensal.categoriaNome}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Valor</dt>
            <dd className="font-medium">
              {currencyFormatter.format(despesaMensal.valor)}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Vencimento</dt>
            <dd className="font-medium">
              {formatarData(despesaMensal.dataVencimento)}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium">
              {STATUS_LABEL[despesaMensal.status] ?? despesaMensal.status}
            </dd>
          </div>

          {despesaMensal.dataPagamento && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Pago em</dt>
              <dd className="font-medium">
                {formatarData(despesaMensal.dataPagamento)}
              </dd>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Origem</dt>
            <dd className="font-medium">
              {despesaMensal.despesaFixaId ? 'Despesa fixa' : 'Avulsa'}
            </dd>
          </div>

          {despesaMensal.observacao && (
            <div className="space-y-1">
              <dt className="text-muted-foreground">Observação</dt>
              <dd className="font-medium">{despesaMensal.observacao}</dd>
            </div>
          )}
        </dl>
      </DialogContent>
    </Dialog>
  )
}

export { DespesaMensalDetalhesDialog }
