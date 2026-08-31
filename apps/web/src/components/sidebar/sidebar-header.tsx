import Image from 'next/image'
import Link from 'next/link'

import logo from '@/assets/financeapplogowordmark.png'
import { SidebarHeader } from '@/components/ui/sidebar'

const AppSidebarHeader = () => {
  return (
    <SidebarHeader>
      <Link href="/">
        <Image src={logo} alt="FinanceApp" priority width={250} height={50} />
      </Link>
    </SidebarHeader>
  )
}

export { AppSidebarHeader }
