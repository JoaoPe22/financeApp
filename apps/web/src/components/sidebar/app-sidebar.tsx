'use client'

import {
  FileText,
  House,
  MessageCircle,
  SquareChartGantt,
  User,
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
