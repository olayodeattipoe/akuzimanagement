import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ServersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Servers Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Server
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Servers</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Server list will go here */}
        </CardContent>
      </Card>
    </div>
  )
} 