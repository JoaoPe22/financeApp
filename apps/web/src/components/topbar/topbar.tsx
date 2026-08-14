'use client'

import { ChevronDown, Loader2, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'

import { authClient } from '@/auth/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSignOut } from '@/hooks/use-sign-out'

const iniciais = (nome?: string) =>
  nome
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('') || '?'

const Topbar = () => {
  const { data: session } = authClient.useSession()
  const { theme, setTheme } = useTheme()
  const { signOut, isSigningOut } = useSignOut()

  const user = session?.user

  return (
    <header className="flex justify-end p-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1.5 outline-none hover:bg-accent">
          <Avatar className="size-7">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name} />
            <AvatarFallback className="text-xs">
              {iniciais(user?.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user?.name}</span>
          <ChevronDown className="size-4 opacity-50" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem asChild>
            <Link href="/perfil" className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name} />
                <AvatarFallback className="text-xs">
                  {iniciais(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-muted-foreground text-xs">
                  {user?.email}
                </span>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <div className="px-2 py-1.5">
            <span className="text-muted-foreground mb-1.5 block text-xs">
              Tema
            </span>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Selecione o tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            disabled={isSigningOut}
            onSelect={(event) => {
              event.preventDefault()
              signOut()
            }}
          >
            {isSigningOut
              ? <Loader2 className="animate-spin" />
              : <LogOut />}
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export { Topbar }
