"use client"

import * as React from "react"
import {
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  Cookie,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "calabash",
    email: "admin@calabash.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChartIcon,
    },
    {
      title: "Sales Analytics",
      url: "/sales-analytics",
      icon: BarChartIcon,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: ListIcon,
    },
    {
      title: "Servers",
      url: "/servers",
      icon: UsersIcon,
    },
    {
      title: "Monitoring",
      url: "/monitoring",
      icon: ListIcon,
    },
    {
      title: "POS Admins",
      url: "/pos-admins",
      icon: SettingsIcon,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: UsersIcon,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: DatabaseIcon,
    }
  ],
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: FileCodeIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
    {
      title: "Help",
      url: "/help",
      icon: HelpCircleIcon,
    }
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: DatabaseIcon,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: FileIcon,
    },
  ],
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <span className="text-lg border-b border-dashed border-b-rose-200 font-medium font-cinzel bg-gradient-to-r from-rose-500 to-emerald-500 text-transparent bg-clip-text">Calabash Kitchen</span>
                <Cookie className="h-16 w-16 text-rose-500" size={64} strokeWidth={1.5} />

              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
