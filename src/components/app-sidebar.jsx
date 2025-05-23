import * as React from "react"
import { GalleryVerticalEnd, Users, BarChart, LineChart, Users2, UserCircle, ShoppingBag, TrendingUp } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

const menuItems = [
  {
    title: "Customize Menu",
    url: "/",
    icon: GalleryVerticalEnd,
  },
  {
    title: "Servers",
    url: "/servers",
    icon: Users,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart,
  },
  {
    title: "Sales Analytics",
    url: "/sales-analytics",
    icon: TrendingUp,
  },
  {
    title: "Monitoring",
    url: "/monitoring",
    icon: LineChart,
  },
  {
    title: "POS Admins",
    url: "/pos-admins",
    icon: Users2,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: UserCircle,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: LineChart,
  },
  {
    title: "Suppliers",
    url: "/suppliers",
    icon: ShoppingBag,
  },
]

export function AppSidebar() {
  const location = useLocation()
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <div className="flex flex-col h-[100dvh]">
          <div className="border-b p-4 shrink-0">
            <div className="flex items-center gap-2">
              <GalleryVerticalEnd className="h-6 w-6" />
              <span className="font-semibold">Restaurant Admin</span>
            </div>
          </div>
          <nav className="flex-1 flex flex-col p-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link 
                key={item.title} 
                to={item.url}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent ${
                  location.pathname === item.url ? 'bg-accent' : ''
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
