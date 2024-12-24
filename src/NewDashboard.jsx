import { AppSidebar } from "@/components/app-sidebar"
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import CustomizeSite from './CustomizeSite'
import ServersPage from './components/Servers/ServersPage'
import AnalyticsPage from './components/Analytics/AnalyticsPage'

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
      default:
        return (
          <div className="max-w-4xl mx-auto w-full">
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
    <div className="min-h-screen">
      <header className="flex h-16 items-center border-b px-4">
        <AppSidebar />
      </header>
      <main className="container mx-auto p-4">
        {getPageContent()}
      </main>
    </div>
  )
}
