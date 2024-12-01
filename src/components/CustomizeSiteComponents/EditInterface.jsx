import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EditInterfaceDialog({ isOpen, onClose, onUpdate, interfaceToEdit }) {
  const [editingInterface, setEditingInterface] = useState(interfaceToEdit)

  useEffect(() => {
    setEditingInterface(interfaceToEdit)
  }, [interfaceToEdit])

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdate(editingInterface)
  }

  if (!editingInterface) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Interface</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editingInterface.name}
              onChange={(e) => setEditingInterface({ ...editingInterface, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={editingInterface.headline}
              onChange={(e) => setEditingInterface({ ...editingInterface, headline: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="logo">Logo</Label>
            <Input
              id="logo"
              type="file"
              onChange={(e) => setEditingInterface({ ...editingInterface, logo: URL.createObjectURL(e.target.files[0]) })}
              accept="image/*"
            />
          </div>
          {editingInterface.logo && (
            <div>
              <img src={editingInterface.logo} alt="Current Logo" className="max-w-xs" />
            </div>
          )}
          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}