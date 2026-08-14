'use client'

import { useQuery } from '@tanstack/react-query'

import { geoService } from '@/services/geo'

const useEstados = () =>
  useQuery({
    queryKey: ['estados'],
    queryFn: () => geoService.getEstados(),
    staleTime: Infinity,
  })

const useCidades = (uf: string) =>
  useQuery({
    queryKey: ['cidades', uf],
    queryFn: () => geoService.getCidades(uf),
    enabled: !!uf,
    staleTime: Infinity,
  })

export { useEstados, useCidades }
