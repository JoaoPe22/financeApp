'use client'

import { Sheet } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { baixarCsv, type ColunaCsv } from '@/lib/csv'

interface DownloadCsvButtonProps<T> {
  colunas: ColunaCsv<T>[]
  linhas: T[]
  fileName: string
}

const DownloadCsvButton = <T,>({
  colunas,
  linhas,
  fileName,
}: DownloadCsvButtonProps<T>) => (
  <Button
    type="button"
    variant="outline"
    disabled={linhas.length === 0}
    onClick={() => baixarCsv(fileName, colunas, linhas)}
  >
    <Sheet />
    Baixar CSV
  </Button>
  )

export { DownloadCsvButton }
