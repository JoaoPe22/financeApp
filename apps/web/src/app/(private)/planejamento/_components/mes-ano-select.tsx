'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

interface MesAnoSelectProps {
  mes: number
  ano: number
  onChangeMes: (mes: number) => void
  onChangeAno: (ano: number) => void
}

const MesAnoSelect = ({
  mes,
  ano,
  onChangeMes,
  onChangeAno,
}: MesAnoSelectProps) => {
  const anoAtual = new Date().getFullYear()
  const anos = Array.from({ length: 6 }, (_, i) => anoAtual - 2 + i)

  return (
    <div className="flex gap-2">
      <Select value={String(mes)} onValueChange={(v) => onChangeMes(Number(v))}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MESES.map((nome, index) => (
            <SelectItem key={nome} value={String(index + 1)}>
              {nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(ano)} onValueChange={(v) => onChangeAno(Number(v))}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {anos.map((anoOpcao) => (
            <SelectItem key={anoOpcao} value={String(anoOpcao)}>
              {anoOpcao}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { MesAnoSelect }
