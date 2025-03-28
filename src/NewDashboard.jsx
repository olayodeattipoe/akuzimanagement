import { AppSidebar } from "@/components/app-sidebar"
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import CustomizeSite from './CustomizeSite'
import ServersPage from './components/Servers/ServersPage'
import AnalyticsPage from './components/Analytics/AnalyticsPage'
import MonitoringDashboard from './components/Monitoring/MonitoringDashboard'
import POSAdminPage from './components/Admin/POSAdminPage'
import CustomersPage from './components/Customers/CustomersPage'
import InventoryPage from "./components/Inventory/InventoryPage"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"

export function NewDashboard() {
  const location = useLocation()
  const [control_array, setControl_array] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  const getPageContent = () => {
    switch (location.pathname) {
      case '/servers':
        return <ServersPage />
      case '/analytics':
        return <AnalyticsPage />
      case '/monitoring':
        return <MonitoringDashboard />
      case '/pos-admins':
        return <POSAdminPage />
      case '/customers':
        return <CustomersPage />
      case '/inventory':
        return <InventoryPage />
      default:
        return (
          <div className="p-4">
            <CustomizeSite
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              array={control_array}
              setControl_array={setControl_array}
            />
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 flex flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {getPageContent()}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


