"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import { InfoIcon, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import StockRuleModal from "./StockRuleModal";
import { Plus, Trash2, Edit, MoreVertical, Search, Filter } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { API_CONFIG } from "@/config/constants";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import AddTransformableDialog from "./AddTransformableDialog";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useSearchParams } from 'react-router-dom';

function CapacityIndicator({ percentage }) {
  const getColor = (index) => {
    if (percentage >= 80) {
      return index < 3 ? "bg-emerald-500" : index < 5 ? "bg-emerald-300" : index < 7 ? "bg-yellow-400" : "bg-red-400";
    } else if (percentage >= 60) {
      return index < 2 ? "bg-emerald-500" : index < 4 ? "bg-emerald-300" : index < 6 ? "bg-yellow-400" : "bg-red-400";
    } else if (percentage >= 40) {
      return index < 1 ? "bg-emerald-500" : index < 3 ? "bg-emerald-300" : index < 5 ? "bg-yellow-400" : "bg-red-400";
    } else {
      return index < 2 ? "bg-yellow-400" : "bg-red-400";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-[2px] justify-center">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`h-[3px] w-6 rounded-sm transition-colors ${getColor(i, percentage)}`} />
        ))}
      </div>
      <div className={`text-xs font-medium ${
        percentage >= 60 ? "text-emerald-600" : 
        percentage >= 40 ? "text-yellow-600" : 
        "text-red-600"
      }`}>
        {percentage}%
      </div>
    </div>
  );
}

function CategoryTab({ title, percentage }) {
  return (
    <div className="flex items-center gap-2">
      <span>{title}</span>
      <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium">
        {percentage}%
      </span>
    </div>
  );
}

function AddTransformablesDialog({ open, onOpenChange, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: "",
    pricing_type: "FIX",
    category: "",
    mode: "individual",
    unit_per_quantity: "0",
    total_number: "0",
    total_quantity: "0",
    reorder_point: "0",
    reorder_quantity: "0"
  });

  // Fetch categories when dialog opens
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "get_category",
          content: {}
        });
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        description: "",
        base_price: "",
        pricing_type: "FIX",
        category: "",
        mode: "individual",
        unit_per_quantity: "0",
        total_number: "0",
        total_quantity: "0",
        reorder_point: "0",
        reorder_quantity: "0"
      });
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "add_transformable",
        content: {
          ...formData,
          base_price: parseFloat(formData.base_price),
          unit_per_quantity: parseFloat(formData.unit_per_quantity),
          total_number: parseInt(formData.total_number),
          total_quantity: parseFloat(formData.total_quantity),
          reorder_point: parseFloat(formData.reorder_point),
          reorder_quantity: parseFloat(formData.reorder_quantity)
        }
      });

      if (response.data.status === "success") {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error adding transformable:", error);
      alert(`Error adding transformable: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
          <DialogTitle>Add Transformable Product</DialogTitle>
          <DialogDescription>
            Enter the details for the new transformable product. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Product Name *
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            {/* Base Price */}
            <div className="space-y-2">
              <Label htmlFor="basePrice" className="text-sm font-medium">
                Base Price (GH₵) *
              </Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pricing Type */}
            <div className="space-y-2">
              <Label htmlFor="pricingType" className="text-sm font-medium">
                Pricing Type *
              </Label>
              <Select
                value={formData.pricing_type}
                onValueChange={(value) => setFormData({ ...formData, pricing_type: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIX">Fixed Price</SelectItem>
                  <SelectItem value="VAR">Variable Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mode */}
            <div className="space-y-2">
              <Label htmlFor="mode" className="text-sm font-medium">
                Mode *
              </Label>
              <Select
                value={formData.mode}
                onValueChange={(value) => setFormData({ ...formData, mode: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="batch">Batch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Unit Per Quantity */}
            <div className="space-y-2">
              <Label htmlFor="unitPerQuantity" className="text-sm font-medium">
                Unit Per Quantity
              </Label>
              <Input
                id="unitPerQuantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_per_quantity}
                onChange={(e) => setFormData({ ...formData, unit_per_quantity: e.target.value })}
              />
            </div>

            {/* Total Number */}
            <div className="space-y-2">
              <Label htmlFor="totalNumber" className="text-sm font-medium">
                Total Number
              </Label>
              <Input
                id="totalNumber"
                type="number"
                min="0"
                value={formData.total_number}
                onChange={(e) => setFormData({ ...formData, total_number: e.target.value })}
              />
            </div>

            {/* Initial Quantity */}
            <div className="space-y-2">
              <Label htmlFor="totalQuantity" className="text-sm font-medium">
                Initial Quantity
              </Label>
              <Input
                id="totalQuantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_quantity}
                onChange={(e) => setFormData({ ...formData, total_quantity: e.target.value })}
              />
            </div>

            {/* Reorder Point */}
            <div className="space-y-2">
              <Label htmlFor="reorderPoint" className="text-sm font-medium">
                Reorder Point
              </Label>
              <Input
                id="reorderPoint"
                type="number"
                min="0"
                step="0.01"
                value={formData.reorder_point}
                onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
              />
            </div>

            {/* Reorder Quantity */}
            <div className="space-y-2">
              <Label htmlFor="reorderQuantity" className="text-sm font-medium">
                Reorder Quantity
              </Label>
              <Input
                id="reorderQuantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.reorder_quantity}
                onChange={(e) => setFormData({ ...formData, reorder_quantity: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Transformable"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddIndirectProductDialog({ open, onOpenChange, transformables }) {
  const [selectedTransformable, setSelectedTransformable] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Selected transformable:', selectedTransformable);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Indirect Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transformable">Select Transformable</Label>
            <Select
              value={selectedTransformable}
              onValueChange={setSelectedTransformable}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a transformable" />
              </SelectTrigger>
              <SelectContent>
                {transformables.map((item) => (
                  <SelectItem key={item.name} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Product</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditQuantitiesModal({ open, onOpenChange, item, isBatchMode, onUpdate }) {
  const [formData, setFormData] = useState({
    last_received_quantity: item?.last_received_quantity?.toString() || '',
    total_quantity: item?.total_quantity?.toString() || '',
    unit_per_quantity: item?.unit_per_quantity?.toString() || '',
    total_number: item?.total_number?.toString() || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        action: "update_inventory_quantities",
        content: {
          type: item.itemType === 'custom_options' ? 'custom_option' : 'product',
          id: item.id,
          mode: isBatchMode ? 'batch' : 'individual',
          last_received_quantity: formData.last_received_quantity ? parseFloat(formData.last_received_quantity) : null,
          total_quantity: formData.total_quantity ? parseFloat(formData.total_quantity) : null
        }
      };

      // Add batch mode fields if in batch mode
      if (isBatchMode) {
        payload.content.unit_per_quantity = formData.unit_per_quantity ? parseFloat(formData.unit_per_quantity) : null;
        payload.content.total_number = formData.total_number ? parseFloat(formData.total_number) : null;
      }

      console.log('Updating quantities with payload:', payload);

      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, payload);
      console.log('Update quantities response:', response);

      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      if (response.data.status === 'success' && response.data.item) {
        // Update both the item's quantities and mode
        const updatedItem = {
          ...item,
          ...response.data.item,
          itemType: item.itemType, // Preserve the item type
          mode: response.data.item.mode || item.mode, // Use new mode if provided, else keep existing
          inventoryMode: response.data.item.mode || item.mode
        };
        onUpdate(updatedItem);
        onOpenChange(false);
      } else {
        throw new Error(response.data.message || 'Failed to update quantities');
      }
    } catch (error) {
      console.error('Error updating quantities:', error);
      alert(error.message || 'Failed to update quantities');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Item Quantities</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="p-3 bg-blue-50 rounded-md border border-blue-100 mb-4">
            <div className="text-sm font-medium text-blue-700">Editing: {item?.name}</div>
            <div className="text-xs text-blue-600 mt-1">Mode: {isBatchMode ? 'Batch' : 'Individual'}</div>
          </div>
          

          <div className="space-y-2">
            <Label htmlFor="total_quantity" className="text-sm font-medium">Current Stock</Label>
            <Input
              id="total_quantity"
              type="number"
              min="0"
              step="0.01"
              value={formData.total_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, total_quantity: e.target.value }))}
              placeholder="Enter Current Stock"
              className="border-gray-300 focus:border-primary"
            />
          </div>
          
          {isBatchMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="unit_per_quantity" className="text-sm font-medium">Unit Per Quantity</Label>
                <Input
                  id="unit_per_quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unit_per_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_per_quantity: e.target.value }))}
                  placeholder="Enter unit per quantity"
                  className="border-gray-300 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_number" className="text-sm font-medium">Total Number</Label>
                <Input
                  id="total_number"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.total_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_number: e.target.value }))}
                  placeholder="Enter total number"
                  className="border-gray-300 focus:border-primary"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button" className="border-gray-300">
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Update Quantities
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ItemDetailsTable({ item, isBatchMode, onItemUpdate }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!item) return null;

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Item Details</h3>
          <p className="text-sm text-gray-500 mt-1">View and manage item quantities and properties</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search details..." 
              className="pl-9 w-[250px] bg-white"
            />
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                {isBatchMode ? (
                  <>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Initial Quantity</TableHead>
                    <TableHead className="font-semibold">Current Stock</TableHead>
                    <TableHead className="font-semibold">Unit Per Quantity</TableHead>
                    <TableHead className="font-semibold">Total Number</TableHead>
                    <TableHead className="font-semibold">Unit Price</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Initial Quantity</TableHead>
                    <TableHead className="font-semibold">Current Stock</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50 transition-colors">
                {isBatchMode ? (
                  <>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>{item.last_received_quantity || '-'}</TableCell>
                    <TableCell>{item.total_quantity || '-'}</TableCell>
                    <TableCell>{item.unit_per_quantity || '-'}</TableCell>
                    <TableCell>{item.total_number || '-'}</TableCell>
                    <TableCell>
                      {item.base_price ? `₵${item.base_price.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={item.percentage > 20 ? "success" : "destructive"}
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          item.percentage > 20 
                            ? "bg-green-50 text-green-700 hover:bg-green-50"
                            : "bg-red-50 text-red-700 hover:bg-red-50"
                        )}
                      >
                        {item.percentage > 20 ? "In Stock" : "Low Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="cursor-pointer hover:bg-gray-50">
                            <Edit className="h-4 w-4 mr-2 text-gray-500" />
                            Edit Quantities
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
                            <Filter className="h-4 w-4 mr-2 text-gray-500" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 cursor-pointer hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>{item.last_received_quantity || '-'}</TableCell>
                    <TableCell>{item.total_quantity || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-gray-100"
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <EditQuantitiesModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        item={item}
        isBatchMode={isBatchMode}
        onUpdate={onItemUpdate}
      />
    </div>
  );
}

function ItemCard({ name, percentage, description, price, pricingType, isAvailable, onClick, isSelected }) {
  return (
    <Card 
      className={cn(
        "bg-white border transition-all duration-200 hover:shadow-md",
        isSelected ? "ring-2 ring-primary border-primary" : "hover:border-gray-300"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1">
            <h3 className="font-medium text-sm text-gray-900">{name}</h3>
            {description && (
              <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
            )}
          </div>
          <CapacityIndicator percentage={percentage} />
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="bg-gray-50 px-2 py-1 rounded-md text-sm font-semibold text-gray-900">{percentage}%</div>
          <div className="flex flex-col items-end gap-1">
            {typeof isAvailable !== 'undefined' && (
              <Badge variant={isAvailable ? "success" : "destructive"} className="text-xs">
                {isAvailable ? "Available" : "Unavailable"}
              </Badge>
            )}
            {price && (
              <div className="text-sm font-medium text-gray-700">
                {pricingType === 'fixed' ? `₵${price.toFixed(2)}` : `+₵${price.toFixed(2)}`}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverallCard() {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-700">Overall Inventory</span>
            <InfoIcon className="h-4 w-4 text-gray-400" />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-5xl font-bold text-gray-900">82%</div>
          <CapacityIndicator percentage={82} />
        </div>
      </CardContent>
    </Card>
  );
}

function EditRelationshipModal({ open, onOpenChange, relationship, sourceItem, onUpdate }) {
  const [quantity, setQuantity] = useState(relationship?.quantity_to_deduct?.toString() || '');
  const [autoDeduct, setAutoDeduct] = useState(relationship?.auto_deduct || false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        action: "update_relationship_quantity",
        content: {
          source_type: sourceItem.mode === 'custom_options' ? 'custom_option' : 'product',
          source_id: sourceItem.id,
          target_type: relationship.type === 'custom_option' ? 'custom_option' : 'product',
          target_id: relationship.related_item.id,
          quantity_to_deduct: parseFloat(quantity),
          auto_deduct: autoDeduct
        }
      };
      
      console.log('Updating relationship with payload:', payload);

      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, payload);
      console.log('Update relationship response:', response);

      if (response?.data?.status === 'success') {
        onUpdate(response.data.relationship);
        onOpenChange(false);
      } else {
        throw new Error(response?.data?.message || 'Failed to update relationship');
      }
    } catch (error) {
      console.error('Error updating relationship:', error);
      alert(error.message || 'Failed to update relationship');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Relationship Quantity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Related Item</Label>
            <div className="p-3 border rounded-md bg-gray-50 flex items-center gap-2">
              <Badge variant="outline" className={cn(
                "capitalize",
                relationship.type === 'custom_option' 
                  ? "bg-purple-50 text-purple-700 border-purple-200" 
                  : "bg-blue-50 text-blue-700 border-blue-200"
              )}>
                {relationship.type === 'custom_option' ? 'Custom Option' : 'Product'}
              </Badge>
              <span className="font-medium">{relationship.related_item.name}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity_to_deduct" className="text-sm font-medium">Quantity to Deduct</Label>
            <Input
              id="quantity_to_deduct"
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity to deduct"
              className="border-gray-300 focus:border-primary"
            />
            <p className="text-xs text-gray-500">This quantity will be deducted from inventory when this item is used</p>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-md bg-blue-50 border-blue-100">
            <Switch
              id="auto-deduct"
              checked={autoDeduct}
              onCheckedChange={setAutoDeduct}
              className="data-[state=checked]:bg-blue-600"
            />
            <div>
              <Label htmlFor="auto-deduct" className="font-medium text-blue-800">Auto-deduct on sale</Label>
              <p className="text-xs text-blue-600 mt-1">When enabled, inventory will be automatically reduced when this item is sold</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button" className="border-gray-300">
              Cancel
            </Button>
            <Button type="submit" disabled={!quantity} className="bg-primary hover:bg-primary/90">
              Update Quantity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddRelationshipModal({ open, onOpenChange, availableItems, mode, onAddRelationship, currentItemId }) {
  const [selectedTab, setSelectedTab] = useState('product');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemAutoDeduct, setSelectedItemAutoDeduct] = useState(false);

  const filteredItems = availableItems.filter(item => item.type === selectedTab);

  const handleAdd = async () => {
    if (selectedItem) {
      try {
        const payload = {
          action: "add_relationship",
          content: {
            source_type: mode === 'custom_options' ? 'custom_option' : 'product',
            source_id: currentItemId,
            target_type: selectedItem.type === 'custom_option' ? 'custom_option' : 'product',
            target_id: selectedItem.id,
            auto_deduct: selectedItemAutoDeduct
          }
        };

        console.log('Creating relationship:', payload);

        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, payload);
        console.log('Add relationship response:', response.data);

        if (response.data?.status === 'success') {
          onAddRelationship(response.data.relationship);
          onOpenChange(false);
          setSelectedItem(null);
          setSelectedItemAutoDeduct(false);
        } else {
          throw new Error(response.data?.message || 'Failed to add relationship');
        }
      } catch (error) {
        console.error('Error adding relationship:', error);
        alert(error.message || 'Failed to add relationship');
      }
    }
  };

  const handleItemClick = (item) => {
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
      setSelectedItemAutoDeduct(false);
    } else {
      setSelectedItem(item);
      setSelectedItemAutoDeduct(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Indirect Product Relationship</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="product" onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="product">Add Indirect Product</TabsTrigger>
            <TabsTrigger value="custom_option">Add Custom Option Choice</TabsTrigger>
          </TabsList>
          
          <TabsContent value="product" className="space-y-4">
            <div className="grid gap-4 max-h-[400px] overflow-y-auto">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all",
                    selectedItem?.id === item.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">ID: {item.id}</div>
                    </div>
                    {selectedItem?.id === item.id && (
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`auto-deduct-${item.id}`} className="text-sm">Auto-deduct</Label>
                        <Switch
                          id={`auto-deduct-${item.id}`}
                          checked={selectedItemAutoDeduct}
                          onCheckedChange={(checked) => {
                            setSelectedItemAutoDeduct(checked);
                            // Prevent the item selection click from triggering
                            event.stopPropagation();
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No available products to add
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="custom_option" className="space-y-4">
            <div className="grid gap-4 max-h-[400px] overflow-y-auto">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all",
                    selectedItem?.id === item.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.option_name && (
                        <div className="text-sm text-gray-500">From: {item.option_name}</div>
                      )}
                      <div className="text-sm text-gray-500">ID: {item.id}</div>
                    </div>
                    {selectedItem?.id === item.id && (
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`auto-deduct-${item.id}`} className="text-sm">Auto-deduct</Label>
                        <Switch
                          id={`auto-deduct-${item.id}`}
                          checked={selectedItemAutoDeduct}
                          onCheckedChange={(checked) => {
                            setSelectedItemAutoDeduct(checked);
                            // Prevent the item selection click from triggering
                            event.stopPropagation();
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No available custom options to add
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedItem}
          >
            Add Relationship
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RelationshipsSection({ item, mode }) {
  const [relationships, setRelationships] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState(null);

  useEffect(() => {
    const fetchRelationships = async () => {
      setError(null);
      
      if (!item) {
        console.log('No item provided to RelationshipsSection');
        setIsLoading(false);
        return;
      }

      console.log('Fetching relationships for:', {
        itemId: item.id,
        mode,
        itemName: item.name
      });

      const itemId = item.id;

      if (!itemId) {
        console.error('No valid ID found:', { item, mode });
        setError('No valid ID found for item');
        setIsLoading(false);
        return;
      }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "get_inventory_relationships",
          content: {
            mode: mode,
            item_id: itemId
          }
        });

        console.log('Relationships response:', response.data);

        if (response.data?.status === 'success') {
          setRelationships(response.data.existing_relationships || []);
          setAvailableItems(response.data.available_items || []);
      } else {
          setError('Failed to fetch relationships');
      }
    } catch (error) {
        console.error("Error fetching relationships:", error);
        setError(error.message || 'Failed to fetch relationships');
    } finally {
      setIsLoading(false);
    }
  };

    fetchRelationships();
  }, [item, mode]);

  const handleAddRelationship = async (relationshipData) => {
    try {
      // TODO: Implement the API call to add the relationship
      console.log('Adding relationship:', relationshipData);
      
      // Refresh relationships after adding
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "get_inventory_relationships",
        content: {
          mode: mode,
          item_id: item.id
        }
      });

      if (response.data?.status === 'success') {
        setRelationships(response.data.existing_relationships || []);
        setAvailableItems(response.data.available_items || []);
      }
    } catch (error) {
      console.error("Error adding relationship:", error);
      // TODO: Show error message to user
    }
  };

  const handleRelationshipUpdate = (updatedRelationship) => {
    setRelationships(prev => prev.map(rel => {
      if (rel.related_item.id === updatedRelationship.target_id) {
        return {
          ...rel,
          quantity_to_deduct: updatedRelationship.quantity_to_deduct
        };
      }
      return rel;
    }));
  };

  const handleRelationshipAutoDeductToggle = async (relationship) => {
    try {
      const payload = {
        action: "update_relationship_quantity",
        content: {
          source_type: mode === 'custom_options' ? 'custom_option' : 'product',
          source_id: item.id,
          target_type: relationship.type === 'custom_option' ? 'custom_option' : 'product',
          target_id: relationship.related_item.id,
          auto_deduct: !relationship.auto_deduct
        }
      };

      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, payload);

      if (response.data?.status === 'success') {
        setRelationships(prev => prev.map(rel => {
          if (rel.related_item.id === relationship.related_item.id) {
            return {
              ...rel,
              auto_deduct: !rel.auto_deduct
            };
          }
          return rel;
        }));
      } else {
        throw new Error(response.data?.message || 'Failed to update auto-deduct setting');
      }
    } catch (error) {
      console.error('Error updating relationship auto-deduct:', error);
      alert(error.message || 'Failed to update auto-deduct setting');
    }
  };

  if (!item) return null;

  return (
    <div className="mt-8 bg-white rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Item Relationships</h3>
          <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4">
            <span>Mode: <span className="font-medium">{mode}</span></span>
            <span>Item ID: <span className="font-medium">{item.id}</span></span>
            <span>Item Name: <span className="font-medium">{item.name}</span></span>
          </div>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Add Other Indirect Products
        </Button>
      </div>
      <div className="p-6">
        {error ? (
          <div className="text-center py-8 bg-red-50 rounded-lg border border-red-100">
            <div className="text-red-600">{error}</div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div className="text-gray-500">Loading relationships...</div>
            </div>
          </div>
        ) : relationships.length > 0 ? (
          <div className="grid gap-4">
            {relationships.map((rel, index) => (
              <div 
                key={`${rel.related_item.id}-${index}`}
                className="flex items-center justify-between p-4 rounded-lg border hover:border-gray-300 transition-colors bg-white"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={cn(
                    "capitalize px-2 py-1",
                    rel.type === 'custom_option' ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"
                  )}>
                    {rel.type === 'custom_option' ? 'Custom Option' : 'Product'}
                  </Badge>
                  <span className="font-medium">{rel.related_item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Deducts:</span>
                    <span className="font-medium bg-gray-100 px-2 py-1 rounded-md text-xs">{rel.quantity_to_deduct} units</span>
                  </div>
                  <Badge 
                    variant={rel.auto_deduct ? "default" : "secondary"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      rel.auto_deduct 
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => handleRelationshipAutoDeductToggle(rel)}
                  >
                    {rel.auto_deduct ? "Auto" : "Manual"}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-gray-100"
                    onClick={() => setEditingRelationship(rel)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit quantity</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-gray-500">No relationships found for this item</div>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Relationship
            </Button>
          </div>
        )}
      </div>

      {editingRelationship && (
        <EditRelationshipModal
          open={!!editingRelationship}
          onOpenChange={(open) => !open && setEditingRelationship(null)}
          relationship={editingRelationship}
          sourceItem={item}
          onUpdate={handleRelationshipUpdate}
        />
      )}

      <AddRelationshipModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        availableItems={availableItems}
        mode={mode}
        onAddRelationship={handleAddRelationship}
        currentItemId={item.id}
      />
    </div>
  );
}

export default function InventoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [tabData, setTabData] = useState({
    products: { items: [], percentage: 0 },
    "custom-options": { items: [], percentage: 0 },
    transformables: { items: [], percentage: 0 }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isBatchMode, setIsBatchMode] = useState(true);
  const [isAddTransformableOpen, setIsAddTransformableOpen] = useState(false);
  const [foodCategories, setFoodCategories] = useState([
    {
      id: "products",
      title: "Products",
      percentage: 0,
      items: [],
    },
    {
      id: "custom-options",
      title: "Custom Options",
      percentage: 0,
      items: [],
    },
    {
      id: "transformables",
      title: "Transformables",
      percentage: 0,
      items: [],
    },
  ]);
  const [addTransformableDialogOpen, setAddTransformableDialogOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const calculatePercentage = (item) => {
    if (!item.total_quantity || item.total_quantity <= 0) return 0;
    return Math.round((item.total_quantity / item.last_received_quantity) * 100);
  };

  const fetchTabData = async (tabId) => {
    setIsLoading(true);
    setSelectedItem(null);
    
    try {
      const modeMap = {
        'products': 'products',
        'custom-options': 'custom_options',
        'transformables': 'transformables'
      };

      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "return_inventory_products",
        content: {
          mode: modeMap[tabId]
        },
      });

      if (response.data && Array.isArray(response.data)) {
        const items = response.data.map(product => {
          const percentage = calculatePercentage(product);
          return {
            ...product,
            percentage,
            id: product.id,
            itemType: modeMap[tabId], // Store the item type (products, custom_options, etc)
            // Use the mode from backend, defaulting to 'batch' if not set
            inventoryMode: product.mode || 'batch'
          };
        });

        const percentage = items.length > 0
          ? Math.round(items.reduce((sum, item) => sum + item.percentage, 0) / items.length)
          : 0;

        setTabData(prev => ({
          ...prev,
          [tabId]: { items, percentage }
        }));

        if (items.length > 0) {
          console.log('Sample item data:', items[0]);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${tabId}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemUpdate = (updatedItem) => {
    // Update the item in the tabData
    setTabData(prev => {
      const newTabData = { ...prev };
      const items = newTabData[activeTab].items.map(item => {
        if (item.id === updatedItem.id) {
          const percentage = calculatePercentage(updatedItem);
          return {
            ...item,
            ...updatedItem,
            unit_per_quantity: updatedItem.unit_per_quantity || item.unit_per_quantity,
            total_number: updatedItem.total_number || item.total_number,
            percentage
          };
        }
        return item;
      });
      
      newTabData[activeTab].items = items;
      newTabData[activeTab].percentage = items.length > 0
        ? Math.round(items.reduce((sum, item) => sum + item.percentage, 0) / items.length)
        : 0;
      
      return newTabData;
    });

    // Update the selected item
    setSelectedItem(prev => {
      if (prev?.id === updatedItem.id) {
        const percentage = calculatePercentage(updatedItem);
        return {
          ...prev,
          ...updatedItem,
          unit_per_quantity: updatedItem.unit_per_quantity || prev.unit_per_quantity,
          total_number: updatedItem.total_number || prev.total_number,
          percentage
        };
      }
      return prev;
    });
  };

  // Clear states when switching tabs
  const handleTabChange = (newTab) => {
    // Clear states
    setSelectedItem(null);
    setSearchQuery("");
    setIsAddTransformableOpen(false);
    
    // Set new tab and fetch data
    setActiveTab(newTab);
    fetchTabData(newTab);
  };

  // Handle item selection with state clearing
  const handleItemSelect = (item) => {
    // If selecting the same item, deselect it
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
      return;
    }
    
    // Clear any open modals or states before setting new item
    setIsAddTransformableOpen(false);
    setSelectedItem(item);
    // Use the saved inventory mode from the item data
    setIsBatchMode(item.mode === 'batch' || item.inventoryMode === 'batch');
  };

  // Fetch initial tab data when component mounts
  useEffect(() => {
    // On mount, check for tab and id in query params
    const tabParam = searchParams.get('tab');
    const idParam = searchParams.get('id');
    if (tabParam && tabData[tabParam]) {
      setActiveTab(tabParam);
      fetchTabData(tabParam).then(() => {
        if (idParam) {
          // Wait for fetch, then select item
          setTimeout(() => {
            const found = tabData[tabParam].items.find((item) => String(item.id) === String(idParam));
            if (found) {
              setSelectedItem(found);
              setIsBatchMode(found.mode === 'batch' || found.inventoryMode === 'batch');
            }
          }, 500); // Wait for data to be set
        }
      });
    } else {
      fetchTabData(activeTab);
    }
    // eslint-disable-next-line
  }, []);

  // Filter items based on search query, with null checks
  const filteredItems = tabData[activeTab]?.items.filter(item => {
    if (!searchQuery) return true;
    const itemName = (item?.name || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return itemName.includes(query);
  });

  const categories = [
    { 
      id: "products", 
      title: "Products",
      description: "Regular menu items and products"
    },
    { 
      id: "custom-options", 
      title: "Custom Options",
      description: "Customizable add-ons and choices"
    },
    { 
      id: "transformables", 
      title: "Transformables",
      description: "Stock items that can be transformed into products"
    }
  ];

  // Get the mode for the selected item
  const getSelectedItemMode = () => {
    // This function returns the item type mode (products, custom_options, etc.)
    switch (activeTab) {
      case 'products':
        return 'products';
      case 'custom-options':
        return 'custom_options';
      case 'transformables':
        return 'transformables';
      default:
        return 'products';
    }
  };

  const handleModeToggle = async (checked) => {
    if (!selectedItem) return;

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "switch_inventory_mode",
        content: {
          type: selectedItem.itemType === 'custom_options' ? 'custom_option' : 'product',
          id: selectedItem.id,
          mode: checked ? 'batch' : 'individual'
        }
      });

      console.log('Switch mode response:', response.data);

      if (response.data?.status === 'success') {
        setIsBatchMode(checked);
        
        // Update both the selected item and the tabData with the new mode
        const newMode = response.data.item.mode;
        
        setSelectedItem(prev => ({
          ...prev,
          mode: newMode,
          inventoryMode: newMode
        }));

        // Update the item in tabData as well
        setTabData(prev => {
          const newTabData = { ...prev };
          const items = newTabData[activeTab].items.map(item => {
            if (item.id === selectedItem.id) {
              return {
                ...item,
                mode: newMode,
                inventoryMode: newMode
              };
            }
            return item;
          });
          
          newTabData[activeTab].items = items;
          return newTabData;
        });

      } else {
        throw new Error(response.data?.message || 'Failed to switch mode');
      }
    } catch (error) {
      console.error('Error switching inventory mode:', error);
      alert(error.message || 'Failed to switch inventory mode');
      // Revert the switch if there was an error
      setIsBatchMode(!checked);
    }
  };

  return (
      <div className="min-h-full w-full">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="px-8 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Inventory</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your inventory items, stock levels, and relationships</p>
            </div>
            <Button 
              variant="outline"
              className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
              onClick={async () => {
                try {
                  const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
                    action: "sync_customization_relationships",
                    content: {}
                  });
                  
                  console.log('Sync response:', response);
                  
                  if (response?.data?.status === 'success') {
                    alert('Successfully synced customization relationships');
                    // Optionally refresh the current tab data
                    fetchTabData(activeTab);
                  } else {
                    throw new Error(response?.data?.message || 'Sync failed');
                  }
                } catch (error) {
                  console.error('Error syncing:', error);
                  alert(error.message || 'Failed to sync customization relationships');
                }
              }}
            >
              <svg 
                width="15" 
                height="15" 
                viewBox="0 0 15 15" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path 
                  d="M1.90321 7.29677C1.90321 10.341 4.11041 12.4147 6.58893 12.8439C6.87255 12.893 7.06266 13.1627 7.01355 13.4464C6.96444 13.73 6.69471 13.9201 6.41109 13.871C3.49942 13.3668 0.86084 10.9127 0.86084 7.29677C0.860839 5.76009 1.55996 4.55245 2.37639 3.63377C2.96124 2.97568 3.63034 2.44135 4.16846 2.03202L2.53205 2.03202C2.25591 2.03202 2.03205 1.80816 2.03205 1.53202C2.03205 1.25588 2.25591 1.03202 2.53205 1.03202L5.53205 1.03202C5.80819 1.03202 6.03205 1.25588 6.03205 1.53202L6.03205 4.53202C6.03205 4.80816 5.80819 5.03202 5.53205 5.03202C5.25591 5.03202 5.03205 4.80816 5.03205 4.53202L5.03205 2.68645L5.03054 2.68759L5.03045 2.68766L5.03044 2.68767L5.03043 2.68767C4.45896 3.11868 3.76059 3.68693 3.15554 4.37353C2.45221 5.16162 1.90321 6.16926 1.90321 7.29677ZM13.0109 7.70321C13.0109 4.69115 10.8505 2.6296 8.40384 2.17029C8.12093 2.11718 7.93465 1.84479 7.98776 1.56188C8.04087 1.27898 8.31326 1.0927 8.59616 1.14581C11.4704 1.68541 14.0532 4.12605 14.0532 7.70321C14.0532 9.23988 13.3541 10.4475 12.5377 11.3662C11.9528 12.0243 11.2837 12.5586 10.7456 12.968L12.3821 12.968C12.6582 12.968 12.8821 13.1918 12.8821 13.468C12.8821 13.7441 12.6582 13.968 12.3821 13.968L9.38205 13.968C9.10591 13.968 8.88205 13.7441 8.88205 13.468L8.88205 10.468C8.88205 10.1918 9.10591 9.96796 9.38205 9.96796C9.65819 9.96796 9.88205 10.1918 9.88205 10.468L9.88205 12.3135L9.88362 12.3123C10.4551 11.8813 11.1535 11.3131 11.7585 10.6264C12.4619 9.83835 13.0109 8.83071 13.0109 7.70321Z" 
                  fill="currentColor" 
                  fillRule="evenodd" 
                  clipRule="evenodd"
                />
              </svg>
              Sync Customizations
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="py-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="">
            <div className="sticky top-[88px] z-40 bg-white py-4 mb-6 rounded-lg">
              <div className="flex items-center justify-between px-4 py-2">
                <TabsList className="w-full flex bg-transparent p-0 justify-start">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className={cn(
                        "data-[state=active]:text-rose-500 border border-gray-200  rounded-md data-[state=active]:border-rose-500 data-[state=active]:shadow-none mx-2 px-6 py-3",
                        "data-[state=active]:bg-transparent text-base transition-all",
                      )}
                    >
                      <div className="flex flex-col items-start">
                        <CategoryTab 
                          title={category.title} 
                          percentage={tabData[category.id].percentage} 
                        />
                        <span className="text-xs text-gray-500 mt-1">{category.description}</span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 w-full bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {categories.map((category) => (
              <TabsContent
                key={category.id}
                value={category.id}
                className="px-8 animate-in fade-in-50 data-[state=active]:animate-in"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-500">Loading {category.title.toLowerCase()}...</div>
                  </div>
                ) : (
                  <>
                {category.id === 'transformables' && (
                  <div className="flex justify-end mb-6">
                    <Button 
                      variant="default" 
                      size="lg" 
                      className="flex items-center gap-2"
                      onClick={() => setIsAddTransformableOpen(true)}
                    >
                      <Plus className="h-5 w-5" />
                      Add Transformables
                    </Button>
                  </div>
                )}
                <AddTransformablesDialog
                  open={isAddTransformableOpen}
                  onOpenChange={setIsAddTransformableOpen}
                  onSuccess={() => {
                    // Refresh inventory data after adding a transformable
                    fetchTabData(activeTab);
                  }}
                />
                <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {tabData[category.id].items.map((item) => (
                    <ItemCard 
                          key={item.id} 
                      name={item.name} 
                      percentage={item.percentage}
                          description={item.description}
                          price={item.base_price}
                          pricingType={item.pricing_type}
                          isAvailable={item.is_available}
                          onClick={() => handleItemSelect(item)}
                          isSelected={selectedItem?.id === item.id}
                    />
                  ))}
                </div>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {selectedItem && (
            <>
            <div className="mt-8">
              <div className="sticky top-[144px] z-30 bg-white py-4 border-b">
                  <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mode-toggle"
                    checked={isBatchMode}
                    onCheckedChange={handleModeToggle}
                  />
                  <Label htmlFor="mode-toggle" className="font-medium">
                    {isBatchMode ? 'Batch Mode' : 'Individual Mode'}
                  </Label>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedItem(null);
                        setIsBatchMode(true);
                      }}
                    >
                      Close Details
                    </Button>
                </div>
              </div>

              <div className="mt-4">
                <ItemDetailsTable 
                  item={selectedItem}
                  isBatchMode={isBatchMode}
                    onItemUpdate={(updatedItem) => {
                      handleItemUpdate(updatedItem);
                    }}
                />
              </div>

                <RelationshipsSection 
                  item={selectedItem}
                  mode={getSelectedItemMode()}
                />
            </div>
            </>
          )}
        </div>
      </div>
  );
}
