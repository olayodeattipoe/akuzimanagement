import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_CONFIG } from "@/config/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AddTransformableDialog({ open, onOpenChange, onSuccess }) {
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

            {/* Total Quantity */}
            <div className="space-y-2">
              <Label htmlFor="totalQuantity" className="text-sm font-medium">
                Total Quantity
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