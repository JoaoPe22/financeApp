'use client'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useParcelamentos } from '@/hooks/use-parcelamentos'
import { usePlanejamentoMensal } from '@/hooks/use-planejamento-mensal'
import { Parcelamento } from '@/types/parcelamento'

import { ParcelamentoFormDialog } from './parcelamento-form-dialog'
import { ParcelamentoItem } from './parcelamento-item'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const hoje = new Date()

const estaQuitado = (parcelamento: Parcelamento) =>
  parcelamento.parcelasPagas >= parcelamento.quantidadeParcelas

interface ListaParcelamentosProps {
  parcelamentos: Parcelamento[]
  vazioTexto: string
}

const ListaParcelamentos = ({
  parcelamentos,
  vazioTexto,
}: ListaParcelamentosProps) => (
  <div className="space-y-3">
    {parcelamentos.length === 0 && (
      <p className="text-muted-foreground text-sm">{vazioTexto}</p>
    )}

    {parcelamentos.map((parcelamento) => (
      <ParcelamentoItem key={parcelamento.id} parcelamento={parcelamento} />
    ))}
  </div>
)

const PageContent = () => {
  const { data: parcelamentos, isLoading } = useParcelamentos()
  // Cada parcela já nasce vinculada ao planejamento_mensal do mês em que
  // vence — reaproveita a mesma rota da aba Mensal pra pegar só as do mês
  // atual, sem precisar somar datas de vencimento no client.
  const { data: planejamentoMesAtual } = usePlanejamentoMensal(
    hoje.getMonth() + 1,
    hoje.getFullYear(),
  )

  const emAndamento = (parcelamentos ?? []).filter(
    (item) => !estaQuitado(item),
  )
  const quitados = (parcelamentos ?? []).filter(estaQuitado)

  const totalIntegral = (parcelamentos ?? []).reduce(
    (soma, item) => soma + (item.valorTotal - item.valorPago),
    0,
  )
  const totalMesAtual = (planejamentoMesAtual?.parcelas ?? []).reduce(
    (soma, parcela) => soma + parcela.valor,
    0,
  )

  return (
    <Card className="mx-auto w-full max-w-3xl rounded-xl shadow-xl">
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

        {!isLoading && (
          <Tabs defaultValue="em-andamento">
            <TabsList variant="line">
              <TabsTrigger value="em-andamento">
                Em andamento ({emAndamento.length})
              </TabsTrigger>
              <TabsTrigger value="quitados">
                Quitados ({quitados.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="em-andamento" className="pt-3">
              <ListaParcelamentos
                parcelamentos={emAndamento}
                vazioTexto="Nenhum parcelamento em andamento."
              />
            </TabsContent>

            <TabsContent value="quitados" className="pt-3">
              <ListaParcelamentos
                parcelamentos={quitados}
                vazioTexto="Nenhum parcelamento quitado ainda."
              />
            </TabsContent>
          </Tabs>
        )}
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
