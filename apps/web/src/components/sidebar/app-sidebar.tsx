'use client'

import {
  FileText,
  House,
  MessageCircle,
  SquareChartGantt,
  User,
} from 'lucide-react'
import { useEffect } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar'
import { useIsTablet } from '@/hooks/use-tablet'

import { AppSidebarHeader } from './sidebar-header'
import { SideBarMenuItemSimple } from './sidebar-menu-item-simple'

const AppSidebar = () => {
  const isTablet = useIsTablet()
  const { isMobile, setOpen } = useSidebar()

  // Em telas de tablet o sidebar expandido some com espaço útil demais —
  // minimiza pro modo ícone sozinho. Só dispara na transição de faixa (não
  // a cada render), então o usuário ainda pode reabrir manualmente depois.
  // `setOpen` fica fora do array de deps de propósito: sua identidade muda
  // a cada toggle (useCallback com `open` na própria dependência lá no
  // primitivo), e incluí-la aqui reexecutava o efeito a cada clique,
  // sobrescrevendo o toggle manual do usuário.
  useEffect(() => {
    if (isMobile) return
    setOpen(!isTablet)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTablet, isMobile])

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <AppSidebarHeader />
      <SidebarContent>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarMenu>
          <SideBarMenuItemSimple href="/" icon={House} label="Dashboard" />
          <SideBarMenuItemSimple
            href="/planejamento"
            icon={SquareChartGantt}
            label="Planejamento"
          />
          <SideBarMenuItemSimple
            href="/chat-financeiro"
            icon={MessageCircle}
            label="Chat Financeiro"
          />
          <SideBarMenuItemSimple
            href="/relatorios"
            icon={FileText}
            label="Relatórios"
          />
          <SideBarMenuItemSimple href="/perfil" icon={User} label="Perfil" />
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export { AppSidebar }
