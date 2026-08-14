'use client'

import {
  BanknoteArrowDown,
  FileText,
  HandCoins,
  House,
  Landmark,
  PiggyBank,
  SquareChartGantt,
  User,
  Wallet,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'
import { usePerfil } from '@/hooks/use-perfil'

import { AppSidebarHeader } from './sidebar-header'
import { SideBarMenuItemSimple } from './sidebar-menu-item-simple'

const AppSidebar = () => {
  const { data: perfil, isLoading } = usePerfil()

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
            href="/despesas-fixas"
            icon={BanknoteArrowDown}
            label="Despesas Fixas"
          />
          <SideBarMenuItemSimple
            href="/parcelamentos"
            icon={Wallet}
            label="Parcelamentos"
          />
          <SideBarMenuItemSimple
            href="/receitas"
            icon={Landmark}
            label="Receitas"
          />
          <SideBarMenuItemSimple
            href="/investimentos"
            icon={PiggyBank}
            label="Investimentos"
          />
          <SideBarMenuItemSimple
            href="/recomendacoes"
            icon={HandCoins}
            label="Recomendacoes"
          />
          <SideBarMenuItemSimple
            href="/relatorios"
            icon={FileText}
            label="Relatorios"
          />

          {!isLoading && !perfil && (
            <SideBarMenuItemSimple href="/perfil" icon={User} label="Perfil" />
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export { AppSidebar }
