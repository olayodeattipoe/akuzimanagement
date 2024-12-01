import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2 } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import AddItemDialog from './AddItemDialog'
import EditItemDialog from './EditItemDialog'
import axios from 'axios'
import ManageCustomOptions from './ManageCustomOptions'
import ManageCategories from './ManageCategories'
import ManageDishPairings from './ManageDishPairings'

export default function EditItems({ array_to_be_added, setarray_to_be_added, selectedCategory, setSelectedCategory }) {
  const [editingItem, setEditingItem] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [categories, setCategories] = useState([])

  const handleEdit = (product) => {
    const itemWithIds = {
        ...product,
        is_available: product.is_available,
        price: product.price,
        description: product.description,
        name: product.name,
        image_url: product.image_url,
        category: product.category
    };
    setEditingItem(itemWithIds);
    setIsEditDialogOpen(true);
  }

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const result = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
          'action': 'get_category',
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setCategories(result.data);
        // Set the first category as the default if not already set
        if (result.data.length > 0 && !selectedCategory) {
          setSelectedCategory(result.data[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (item) => {
    try {
      // Filter out the item locally first
      const updatedArray = array_to_be_added.filter((p) => p.id !== item.id);
      setarray_to_be_added(updatedArray);

      // Make the API call
      await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
        'action': 'delete_product',
        'content': { 
          'selectedCategory': selectedCategory, 
          'item_id': item.id 
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      // If the API call fails, revert the local change
      setarray_to_be_added(array_to_be_added);
    }
  }

  useEffect(() => {
    const sendPostRequest = async () => {
      if (selectedCategory === '') {
        console.log('No category selected')
      } else {
        try {
          const result = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
            'action': 'get_category_products',
            'content': selectedCategory
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          setarray_to_be_added(result.data)
        } catch (error) {
          console.error('There was an error!', error);
        }
      }
    };

    sendPostRequest();
  }, [selectedCategory]);

  const handleAvailabilityToggle = async (item) => {
    try {
      const result = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
        'action': 'is_product_available',
        'content': { 
           ...item, category: selectedCategory 
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Update array with the returned item
      const updatedArray = array_to_be_added.map(product => 
        product.id === result.data.id ? result.data : product
      );
      setarray_to_be_added(updatedArray);

    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Edit Menu Items</CardTitle>
        <ManageDishPairings />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="flex gap-4">
            <AddItemDialog
              categories={categories}
              setarray_to_be_added={setarray_to_be_added}
            />
            <ManageCustomOptions/>
            <ManageCategories 
              categories={categories}
              setCategories={setCategories}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories && categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {array_to_be_added.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.base_price}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => handleDelete(product)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={product.is_available}
                      onCheckedChange={() => handleAvailabilityToggle(product)}
                    />
                    <span className="text-sm">
                      {product.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {editingItem && (
          <EditItemDialog
            product={editingItem}
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            category_array={categories}
            selectedCategory={selectedCategory}
            setProductArray={setarray_to_be_added}
          />
        )}
      </CardContent>
    </Card>
  )
}

