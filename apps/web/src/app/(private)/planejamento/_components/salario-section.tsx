'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAtualizarSalarioRecebido } from '@/hooks/use-planejamento-mensal'
import { Planejamento } from '@/types/planejamento-mensal'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface SalarioSectionProps {
  planejamento: Planejamento
  mes: number
  ano: number
}

const SalarioSection = ({ planejamento, mes, ano }: SalarioSectionProps) => {
  const [salarioRecebido, setSalarioRecebido] = useState(
    planejamento.salarioRecebido?.toString() ?? '',
  )
  const { mutate: atualizarSalarioRecebido, isPending } =
    useAtualizarSalarioRecebido(mes, ano)

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
      <div>
        <p className="text-muted-foreground text-sm">Salário previsto</p>
        <p className="font-medium">
          {planejamento.salarioPrevisto !== null
            ? currencyFormatter.format(planejamento.salarioPrevisto)
            : 'Não informado no perfil'}
        </p>
      </div>

      <Field className="max-w-40">
        <FieldLabel htmlFor="salarioRecebido">Salário recebido</FieldLabel>
        <Input
          id="salarioRecebido"
          type="number"
          step="0.01"
          min="0"
          value={salarioRecebido}
          onChange={(event) => setSalarioRecebido(event.target.value)}
        />
      </Field>

      <Button
        type="button"
        variant="secondary"
        disabled={isPending || salarioRecebido === ''}
        onClick={() =>
          atualizarSalarioRecebido({
            id: planejamento.id,
            salarioRecebido: Number(salarioRecebido),
          })}
      >
        {isPending && <Loader2 className="animate-spin" />}
        Salvar salário
      </Button>
    </div>
  )
}

export { SalarioSection }
