import { geoApi } from '@/lib/geo-api'

type Estado = { nome: string; sigla: string }

const geoService = {
  getEstados: () => geoApi.get('states').json<Estado[]>(),
  getCidades: (uf: string) =>
    geoApi.get(`states/${uf}/cities`).json<string[]>(),
}

export { geoService }
export type { Estado }
