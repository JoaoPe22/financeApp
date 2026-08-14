import { AppSidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { SidebarProvider } from '@/components/ui/sidebar'

const PrivateLayout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <main className="overflow-x-hidden">
      <SidebarProvider className="p-2" defaultOpen>
        <AppSidebar />
        <section className="flex min-w-0 flex-1 flex-col gap-2">
          <Topbar />
          <div className="overflow-x-hidden">{children}</div>
        </section>
      </SidebarProvider>
    </main>
  )
}

export default PrivateLayout
