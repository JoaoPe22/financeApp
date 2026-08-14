'use client'

import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

interface SideBarMenuItemSimpleProps {
  href: string
  icon: LucideIcon
  label: string
}

const SideBarMenuItemSimple = ({
  icon: Icon,
  label,
  href,
}: SideBarMenuItemSimpleProps) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={href} prefetch={false}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export { SideBarMenuItemSimple }
