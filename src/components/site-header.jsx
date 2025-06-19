import { useLocation } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Cookie } from "lucide-react"

export function SiteHeader() {
  const location = useLocation()

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/servers':
        return 'Servers'
      case '/analytics':
        return 'Sales Analytics'
      case '/monitoring':
        return 'Monitoring Dashboard'
      case '/pos-admins':
        return 'POS Administrators'
      case '/customers':
        return 'Customers'
      case '/inventory':
        return 'Inventory Management'
      default:
        return 'Dashboard'
    }
  }

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <h1 className="text-base font-medium">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-medium font-cinzel bg-gradient-to-r from-rose-500 to-emerald-500 text-transparent bg-clip-text">Calabash Kitchen</span>
          <Cookie className="h-4 w-4 text-rose-500" size={64} strokeWidth={1.5} />
        </div>
      </div>

    </header>
  )
}
