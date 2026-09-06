'use client'

import { Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDeletarContaBancaria } from '@/hooks/use-contas-bancarias'
import { ContaBancaria } from '@/types/conta-bancaria'

import { ContaBancariaFormDialog } from './conta-bancaria-form-dialog'

interface ContaBancariaItemProps {
  contaBancaria: ContaBancaria
}

const ContaBancariaItem = ({ contaBancaria }: ContaBancariaItemProps) => {
  const { mutate: deletarContaBancaria, isPending: isDeleting } =
    useDeletarContaBancaria()

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <p className="font-medium">
          {contaBancaria.apelido ?? contaBancaria.banco}
        </p>
        <p className="text-muted-foreground text-sm">
          {contaBancaria.banco}
          {contaBancaria.agencia ? ` · Ag. ${contaBancaria.agencia}` : ''}
          {contaBancaria.conta ? ` · Conta ${contaBancaria.conta}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ContaBancariaFormDialog contaBancaria={contaBancaria} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={() => {
            if (
              confirm(
                `Remover a conta "${contaBancaria.banco}"? As despesas vinculadas ficam sem conta.`,
              )
            ) {
              deletarContaBancaria(contaBancaria.id)
            }
          }}
        >
          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </div>
  )
}

export { ContaBancariaItem }
