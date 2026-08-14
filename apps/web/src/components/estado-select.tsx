'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useEstados } from '@/hooks/use-geo'

interface EstadoSelectProps {
  value: string
  onChange: (sigla: string) => void
  disabled?: boolean
}

const EstadoSelect = ({ value, onChange, disabled }: EstadoSelectProps) => {
  const [open, setOpen] = useState(false)
  const { data: estados = [], isLoading } = useEstados()

  const selected = estados.find((e) => e.sigla === value)

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between overflow-hidden font-normal"
          disabled={disabled || isLoading}
        >
          <span className="truncate">
            {selected
              ? `${selected.sigla} — ${selected.nome}`
              : 'Selecione o estado'}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Command>
          <CommandInput placeholder="Buscar estado..." />
          <CommandList className="max-h-60">
            <CommandEmpty>Nenhum estado encontrado</CommandEmpty>
            <CommandGroup>
              {estados.map((estado) => (
                <CommandItem
                  key={estado.sigla}
                  value={`${estado.sigla} ${estado.nome}`}
                  onSelect={() => {
                    onChange(estado.sigla)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={`mr-2 size-4 ${
                      value === estado.sigla ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {estado.sigla} — {estado.nome}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { EstadoSelect }
