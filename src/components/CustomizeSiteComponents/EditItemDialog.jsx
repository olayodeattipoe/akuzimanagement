'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Image as ImageIcon, DollarSign, Tag } from "lucide-react"
import axios from 'axios'
import { API_CONFIG } from '@/config/constants'

export default function EditProductDialog({ product, open, setOpen, category_array, selectedCategory, setProductArray }) {
  const [editingProduct, setEditingProduct] = useState(product)
  const [activeTab, setActiveTab] = useState("basic")
  const [imageUrl, setImageUrl] = useState(product?.image_url || "")

  // Ensure the product is loaded properly when the component mounts
  useEffect(() => {
    if (product) {
      setEditingProduct(product);
      setImageUrl(product.image_url || "");
    }
  }, [product]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productToSubmit = {
        ...editingProduct,
        image_url: imageUrl || "",
      };

      console.log('Sending to server:', productToSubmit);

      const result = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'edit_product',
        'content': productToSubmit
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Server response:', result.data);
      setProductArray(result.data);
      setOpen(false);

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save changes');
    }
  }

  const handleCategoryChange = (value) => {
    setEditingProduct({ ...editingProduct, category: parseInt(value) }); // Parse the value to an integer
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Product: {editingProduct.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the basic details of the product.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={editingProduct.category || ''}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger>
                        <span>
                          {editingProduct.category 
                            ? category_array.find(c => c.id === editingProduct.category)?.name 
                            : 'Select a category'}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {category_array.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="is_available">Availability</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        id="is_available"
                        type="checkbox"
                        checked={editingProduct.is_available}
                        onChange={() => setEditingProduct({ ...editingProduct, is_available: !editingProduct.is_available })}
                      />
                      <Label htmlFor="is_available">Available for Sale</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription>Provide more information about the product.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={editingProduct.base_price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, base_price: e.target.value })}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="bg-black" htmlFor="pricing_type">Pricing Type</Label>
                    <Select
                      value={editingProduct.pricing_type}
                      onValueChange={(value) => setEditingProduct({ ...editingProduct, pricing_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Pricing Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIX">Fixed</SelectItem>
                        <SelectItem value="INC">Incremental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="image">
              <Card>
                <CardHeader>
                  <CardTitle>Product Image</CardTitle>
                  <CardDescription>Add an image URL for your product.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="image_url"
                        type="url"
                        placeholder="Paste your image URL here or leave empty for none"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-grow"
                      />
                    </div>
                    {imageUrl && (
                      <div className="mt-4">
                        <img 
                          src={imageUrl} 
                          alt="Product preview" 
                          className="max-w-[300px] rounded-md"
                          onError={() => {
                            setImageUrl("");
                            alert("Invalid image URL. Please try another one.");
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
