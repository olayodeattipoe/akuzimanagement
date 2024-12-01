import { useState } from 'react'
import Preview from './Preview'
import { Home, LayoutGrid } from "lucide-react"
import CustomizeSite from './CustomizeSite'
import { NewDashboard } from "./NewDashboard"

export default function Dashboard() {


    const [control_array, setControl_array] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('')

    //Add more items to this array to add more items to the SideBar Menu using the format below
    const SideBarItems = [
        { name: "Home", icon: Home, content: (<h1 className="text-2xl font-bold">Welcome to Restaurant Admin</h1>) },
        { name: "Customize Site", icon: LayoutGrid, content: (<CustomizeSite selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} array={control_array} setControl_array={setControl_array} />) },
    ]

    //set default page to first item in SideBarItems
    const [activeItem, setActiveItem] = useState(SideBarItems[0]['name'])

    return (
        <div className="flex h-screen">
            <NewDashboard />
            <aside style={{ width: '31.5%' }} className=" overflow-y-auto border-l">
                <Preview array={control_array} setArray={setControl_array} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
            </aside>
        </div>
    )
}

