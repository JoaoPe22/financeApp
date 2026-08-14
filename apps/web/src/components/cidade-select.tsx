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
import { useCidades } from '@/hooks/use-geo'

interface CidadeSelectProps {
  value: string;
  onChange: (cidade: string) => void;
  uf: string;
  disabled?: boolean;
}

const CidadeSelect = ({ value, onChange, uf, disabled }: CidadeSelectProps) => {
  const [open, setOpen] = useState(false)
  const { data: cidades = [], isLoading } = useCidades(uf)

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between overflow-hidden font-normal"
          disabled={!uf || disabled || isLoading}
        >
          <span className="truncate">
            {value ||
              (uf
                ? 'Selecione a cidade'
                : 'Selecione o estado primeiro')}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Command>
          <CommandInput placeholder="Buscar cidade..." />
          <CommandList className="max-h-60">
            <CommandEmpty>Nenhuma cidade encontrada</CommandEmpty>
            <CommandGroup>
              {cidades.map((cidade) => (
                <CommandItem
                  key={cidade}
                  value={cidade}
                  onSelect={() => {
                    onChange(cidade)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={`mr-2 size-4 ${
                      value === cidade
? 'opacity-100'
: 'opacity-0'
                    }`}
                  />
                  {cidade}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { CidadeSelect }
