'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { PageContent as ContasBancariasTab } from './contas-bancarias/page-content'
import { PageContent as DespesasFixasTab } from './despesas-fixas/page-content'
import { PageContent as InvestimentosTab } from './investimentos/page-content'
import { PageContent as ObjetivosTab } from './objetivos/page-content'
import { PageContent as ParcelamentosTab } from './parcelamentos/page-content'
import { PlanejamentoMensalTab } from './planejamento-mensal-tab'
import { PageContent as ReservasTab } from './reservas/page-content'

const PageContent = () => (
  <Tabs defaultValue="mensal" className="w-full">
    <TabsList variant="line">
      <TabsTrigger value="mensal">Mensal</TabsTrigger>
      <TabsTrigger value="despesas-fixas">Despesas Fixas</TabsTrigger>
      <TabsTrigger value="parcelamentos">Parcelamentos</TabsTrigger>
      <TabsTrigger value="reservas">Reservas</TabsTrigger>
      <TabsTrigger value="investimentos">Investimentos</TabsTrigger>
      <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
      <TabsTrigger value="contas-bancarias">Contas</TabsTrigger>
    </TabsList>

    <TabsContent value="mensal">
      <PlanejamentoMensalTab />
    </TabsContent>
    <TabsContent value="despesas-fixas">
      <DespesasFixasTab />
    </TabsContent>
    <TabsContent value="parcelamentos">
      <ParcelamentosTab />
    </TabsContent>
    <TabsContent value="reservas">
      <ReservasTab />
    </TabsContent>
    <TabsContent value="investimentos">
      <InvestimentosTab />
    </TabsContent>
    <TabsContent value="objetivos">
      <ObjetivosTab />
    </TabsContent>
    <TabsContent value="contas-bancarias">
      <ContasBancariasTab />
    </TabsContent>
  </Tabs>
)

export { PageContent }
