import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { DashboardResponse } from '@/types/dashboard'

const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get('dashboard').json<DashboardResponse>(),
  })

export { useDashboard }
