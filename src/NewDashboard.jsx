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

export function NewDashboard() {
  const location = useLocation()
  const [control_array, setControl_array] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  
  const getPageContent = () => {
    switch(location.pathname) {
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
          return <InventoryPage/>
      default:
        return (
          <CustomizeSite 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
            array={control_array} 
            setControl_array={setControl_array} 
          />
        )
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background w-full">
      <header className="sticky top-0 z-50 flex h-16 items-center border-b px-4 bg-background w-full">
        <AppSidebar />
      </header>
      <main className="flex-1 w-full">
        {getPageContent()}
      </main>
    </div>
  )
}
