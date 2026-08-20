import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { DashboardResponse } from '@/types/dashboard'

// Sem mes/ano a API usa o mês corrente. Os lembretes são sempre relativos a
// hoje, então o sino de notificações pode usar a mesma query da home.
const useDashboard = (mes?: number, ano?: number) =>
  useQuery({
    queryKey: ['dashboard', mes, ano],
    queryFn: () =>
      apiClient
        .get('dashboard', {
          searchParams:
            mes != null && ano != null ? { mes, ano } : undefined,
        })
        .json<DashboardResponse>(),
  })

export { useDashboard }
