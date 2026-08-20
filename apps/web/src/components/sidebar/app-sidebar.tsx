'use client'

import {
  BanknoteArrowDown,
  FileText,
  House,
  MessageCircle,
  PiggyBank,
  ShieldCheck,
  SquareChartGantt,
  Target,
  User,
  Wallet,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'

import { AppSidebarHeader } from './sidebar-header'
import { SideBarMenuItemSimple } from './sidebar-menu-item-simple'

const AppSidebar = () => {
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
            href="/investimentos"
            icon={PiggyBank}
            label="Investimentos"
          />
          <SideBarMenuItemSimple
            href="/objetivos"
            icon={Target}
            label="Objetivos"
          />
          <SideBarMenuItemSimple
            href="/reservas"
            icon={ShieldCheck}
            label="Reservas"
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
