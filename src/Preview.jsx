import React from 'react'
import Header from './components/PreviewComponents/header'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartNoAxesGantt, Plus, ShoppingBag } from "lucide-react"
import NavMenu from './components/PreviewComponents/navMenu'
import Search from './components/PreviewComponents/search'

export default function Preview({array,setArray,selectedCategory, setSelectedCategory}) {

  return (
    <div className="min-h-screen">
      <Card className="shadow-none w-full m-2 border-none rounded-none max-w-lg mx-auto bg-white">
          <Header/>
          <Search/>
          <NavMenu array = {array} setarray_to_be_added={setArray} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
      </Card>
    </div>
  )
}
