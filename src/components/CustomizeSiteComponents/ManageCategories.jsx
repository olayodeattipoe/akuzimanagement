import { useState, useEffect} from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, ListPlus } from 'lucide-react'
import axios from 'axios'

const FOOD_TYPES = [
  { value: 'MD', label: 'Main Dish' },
  { value: 'SA', label: 'Stand Alone' },
  { value: 'PK', label: 'Packages' }
]

export default function ManageCategories({ categories, setCategories }) {
  const [newCategory, setNewCategory] = useState({ name: '', food_type: '' })
  const [editingCategory, setEditingCategory] = useState(null)

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.food_type) {
      alert('Please fill in all fields')
      return
    }

    try {
      const result = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
        'action': 'add_category',
        'content': newCategory
      }, {
        headers: { 'Content-Type': 'application/json' },
      })
      setCategories(result.data)
      setNewCategory({ name: '', food_type: '' })
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const handleEditCategory = async (category) => {
    try {
      const result = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
        'action': 'edit_category',
        'content': category
      }, {
        headers: { 'Content-Type': 'application/json' },
      })
      setCategories(result.data)
      setEditingCategory(null)
    } catch (error) {
      console.error('Error editing category:', error)
    }
  }

  const handleDeleteCategory = async (category) => {
    if (!confirm('Are you sure? This will delete all products in this category.')) {
      return
    }

    try {
      const result = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
        'action': 'delete_category',
        'content': category
      }, {
        headers: { 'Content-Type': 'application/json' },
      })
      setCategories(result.data)
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  useEffect(()=>{
      console.log("ssolo_levelling", categories)
  },[categories])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ListPlus className="h-4 w-4 mr-2" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="categoryName">Name</Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="foodType">Food Type</Label>
              <Select 
                value={newCategory.food_type} 
                onValueChange={(value) => setNewCategory({ ...newCategory, food_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {FOOD_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddCategory} className="mt-6">Add Category</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Food Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {editingCategory?.id === category.id ? (
                      <Input
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      />
                    ) : category.name}
                  </TableCell>
                  <TableCell>
                    {editingCategory?.id === category.id ? (
                      <Select 
                        value={editingCategory.food_type}
                        onValueChange={(value) => setEditingCategory({ ...editingCategory, food_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FOOD_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : FOOD_TYPES.find(t => t.value === category.food_type)?.label}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingCategory?.id === category.id ? (
                        <>
                          <Button onClick={() => handleEditCategory(editingCategory)}>Save</Button>
                          <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" onClick={() => setEditingCategory(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" onClick={() => handleDeleteCategory(category)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
} 