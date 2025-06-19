"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { API_CONFIG } from "@/config/constants";
import { Label } from "@/components/ui/label";
import SuppliersTable from "./SuppliersTable";
import PurchasesTable from "./PurchasesTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SuppliersPage() {
  const [activeTab, setActiveTab] = useState("suppliers");
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [addSupplierDialogOpen, setAddSupplierDialogOpen] = useState(false);
  const [addPurchaseDialogOpen, setAddPurchaseDialogOpen] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({
    name: "",
    location: "",
    contact_details: ""
  });
  
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [filterSupplier, setFilterSupplier] = useState("all");

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "get_suppliers",
        content: {}
      });
      
      if (Array.isArray(response.data)) {
        setSuppliers(response.data);
        setFilteredSuppliers(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch purchases
  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "get_purchases",
        content: {}
      });
      
      if (Array.isArray(response.data)) {
        setPurchases(response.data);
        setFilteredPurchases(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new supplier
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "add_supplier",
        content: newSupplierData
      });
      
      if (response.data.status === "success") {
        // Refresh suppliers list
        fetchSuppliers();
        // Reset form and close dialog
        setNewSupplierData({ name: "", location: "", contact_details: "" });
        setAddSupplierDialogOpen(false);
      } else {
        console.error("Error adding supplier:", response.data.message);
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a supplier
  const handleDeleteSupplier = async (supplierId) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "delete_supplier",
        content: { id: supplierId }
      });
      
      if (response.data.status === "success") {
        fetchSuppliers();
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating a supplier
  const handleUpdateSupplier = async (supplierData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "update_supplier",
        content: supplierData
      });
      
      if (response.data.status === "success") {
        fetchSuppliers();
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a purchase
  const handleDeletePurchase = async (purchaseId) => {
    if (!window.confirm("Are you sure you want to delete this purchase?")) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "delete_purchase",
        content: { id: purchaseId }
      });
      
      if (response.data.status === "success") {
        fetchPurchases();
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    if (activeTab === "suppliers") {
      const filtered = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_details.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    } else {
      let filtered = purchases;
      
      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(purchase => 
          (purchase.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (purchase.item?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (purchase.notes?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Filter by supplier
      if (filterSupplier !== "all") {
        filtered = filtered.filter(purchase => purchase.supplier.id.toString() === filterSupplier);
      }
      
      setFilteredPurchases(filtered);
    }
  }, [searchTerm, suppliers, purchases, activeTab, filterSupplier]);

  // Initial data load
  useEffect(() => {
    fetchSuppliers();
    fetchPurchases();
  }, []);

  // When tab changes, reset search
  useEffect(() => {
    setSearchTerm("");
    setFilterSupplier("all");
  }, [activeTab]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-bold mb-6">Suppliers & Purchases</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[250px]"
              />
            </div>
            
            {activeTab === "suppliers" ? (
              <Button onClick={() => setAddSupplierDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            ) : (
              <div className="flex gap-2">
                {suppliers.length > 0 && (
                  <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Suppliers</SelectItem>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button onClick={() => setAddPurchaseDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Purchase
                </Button>
              </div>
            )}
          </div>
        </div>

        <TabsContent value="suppliers">
          <Card>
            <CardContent className="pt-6">
              <SuppliersTable 
                suppliers={filteredSuppliers} 
                isLoading={isLoading}
                onDelete={handleDeleteSupplier}
                onUpdate={handleUpdateSupplier}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardContent className="pt-6">
              <PurchasesTable 
                purchases={filteredPurchases} 
                suppliers={suppliers}
                isLoading={isLoading}
                onDelete={handleDeletePurchase}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Supplier Dialog */}
      <Dialog open={addSupplierDialogOpen} onOpenChange={setAddSupplierDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Enter the details for the new supplier. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSupplier} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name</Label>
                <Input 
                  id="name"
                  required
                  value={newSupplierData.name}
                  onChange={(e) => setNewSupplierData({...newSupplierData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location"
                  required
                  value={newSupplierData.location}
                  onChange={(e) => setNewSupplierData({...newSupplierData, location: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Details</Label>
                <Input 
                  id="contact"
                  value={newSupplierData.contact_details}
                  onChange={(e) => setNewSupplierData({...newSupplierData, contact_details: e.target.value})}
                  placeholder="Phone, email, website, etc."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddSupplierDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Supplier"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Purchase Dialog */}
      <AddPurchaseDialog
        open={addPurchaseDialogOpen}
        onOpenChange={setAddPurchaseDialogOpen}
        suppliers={suppliers}
        onAddPurchase={fetchPurchases}
      />
    </div>
  );
}

// Add Purchase Dialog Component
function AddPurchaseDialog({ open, onOpenChange, suppliers, onAddPurchase }) {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [optionChoices, setOptionChoices] = useState([]);
  const [transformables, setTransformables] = useState([]);
  const [purchaseData, setPurchaseData] = useState({
    supplier_id: "",
    item_type: "product",
    item_id: "",
    unit_price: "",
    purchase_quantity: "",
    purchase_number: "",
    currency: "GHS",
    notes: ""
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setPurchaseData({
        supplier_id: "",
        item_type: "product",
        item_id: "",
        unit_price: "",
        purchase_quantity: "",
        purchase_number: "",
        currency: "GHS",
        notes: ""
      });
    }
  }, [open]);
  
  // Fetch products, option choices, and transformables for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "return_inventory_products",
          content: { mode: "products" }
        });
        if (Array.isArray(response.data)) {
          setProducts(response.data.map(product => ({
            ...product,
            id: product.id.toString()
          })));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    const fetchOptionChoices = async () => {
      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "return_inventory_products",
          content: { mode: "custom_options" }
        });
        if (Array.isArray(response.data)) {
          setOptionChoices(response.data.map(option => ({
            ...option,
            id: option.id.toString()
          })));
        }
      } catch (error) {
        console.error("Error fetching option choices:", error);
      }
    };
    const fetchTransformables = async () => {
      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "return_inventory_products",
          content: { mode: "transformables" }
        });
        if (Array.isArray(response.data)) {
          setTransformables(response.data.map(option => ({
            ...option,
            id: option.id.toString()
          })));
        }
      } catch (error) {
        console.error("Error fetching transformables:", error);
      }
    };
    if (open) {
      fetchProducts();
      fetchOptionChoices();
      fetchTransformables();
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Get the selected item details
      let selectedItem;
      if (purchaseData.item_type === "product") {
        selectedItem = products.find(p => p.id === purchaseData.item_id);
      } else if (purchaseData.item_type === "option_choice") {
        selectedItem = optionChoices.find(o => o.id === purchaseData.item_id);
      } else if (purchaseData.item_type === "transformable") {
        selectedItem = transformables.find(t => t.id === purchaseData.item_id);
      }
      if (!selectedItem) {
        alert("Please select a valid item");
        setIsLoading(false);
        return;
      }
      // Log the data being sent for debugging
      console.log("Sending purchase data:", {
        supplier_id: parseInt(purchaseData.supplier_id),
        item_type: purchaseData.item_type === 'transformable' ? 'products' : purchaseData.item_type,
        item_id: parseInt(purchaseData.item_id),
        selectedItem
      });
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "add_purchase",
        content: {
          supplier_id: parseInt(purchaseData.supplier_id),
          item_type: purchaseData.item_type === 'transformable' ? 'product' : purchaseData.item_type,
          item_id: parseInt(purchaseData.item_id),
          unit_price: parseFloat(purchaseData.unit_price),
          purchase_quantity: parseFloat(purchaseData.purchase_quantity),
          purchase_number: purchaseData.purchase_number ? parseInt(purchaseData.purchase_number) : null,
          currency: purchaseData.currency,
          notes: purchaseData.notes || "",
          item_name: selectedItem.name
        }
      });
      if (response.data.status === "success") {
        onOpenChange(false);
        onAddPurchase();
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error adding purchase:", error);
      alert(`Error adding purchase: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 pb-4 border-b">
          <DialogTitle>Add New Purchase</DialogTitle>
          <DialogDescription>
            Enter the purchase details. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier */}
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-sm font-medium">
                Supplier *
              </Label>
              <Select 
                value={purchaseData.supplier_id} 
                onValueChange={(value) => setPurchaseData({...purchaseData, supplier_id: value})}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Item Type */}
            <div className="space-y-2">
              <Label htmlFor="itemType" className="text-sm font-medium">
                Item Type *
              </Label>
              <Select 
                value={purchaseData.item_type} 
                onValueChange={(value) => setPurchaseData({...purchaseData, item_type: value, item_id: ""})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="option_choice">Option Choice</SelectItem>
                  <SelectItem value="transformable">Transformable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Item Selection */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="item" className="text-sm font-medium">
                Item *
              </Label>
              <Select 
                value={purchaseData.item_id} 
                onValueChange={(value) => {
                  let selectedItem;
                  if (purchaseData.item_type === "product") {
                    selectedItem = products.find(p => p.id === value);
                  } else if (purchaseData.item_type === "option_choice") {
                    selectedItem = optionChoices.find(o => o.id === value);
                  } else if (purchaseData.item_type === "transformable") {
                    selectedItem = transformables.find(t => t.id === value);
                  }
                  setPurchaseData({
                    ...purchaseData, 
                    item_id: value,
                    unit_price: selectedItem?.base_price?.toString() || ""
                  });
                }}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-100 px-2 py-2">
                    <Input
                      placeholder="Search items..."
                      className="h-8"
                      onChange={(e) => {
                        const searchBox = e.target;
                        const items = document.querySelectorAll('[data-item-name]');
                        const searchTerm = searchBox.value.toLowerCase();
                        items.forEach(item => {
                          const itemName = item.getAttribute('data-item-name').toLowerCase();
                          if (itemName.includes(searchTerm)) {
                            item.style.display = '';
                          } else {
                            item.style.display = 'none';
                          }
                        });
                      }}
                    />
                  </div>
                  {purchaseData.item_type === "product" &&
                    products.map(product => (
                      <SelectItem 
                        key={product.id} 
                        value={product.id}
                        data-item-name={product.name}
                      >
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs text-gray-500">
                            Current Stock: {product.total_quantity || 0} | Base Price: GH₵{product.base_price || 'N/A'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  {purchaseData.item_type === "option_choice" &&
                    optionChoices.map(option => (
                      <SelectItem 
                        key={option.id} 
                        value={option.id}
                        data-item-name={option.name}
                      >
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{option.name}</span>
                          <span className="text-xs text-gray-500">
                            Current Stock: {option.total_quantity || 0} | Base Price: GH₵{option.base_price || 'N/A'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  {purchaseData.item_type === "transformable" &&
                    transformables.map(option => (
                      <SelectItem 
                        key={option.id} 
                        value={option.id}
                        data-item-name={option.name}
                      >
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{option.name}</span>
                          <span className="text-xs text-gray-500">
                            Current Stock: {option.total_quantity || 0} | Base Price: GH₵{option.base_price || 'N/A'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unit Price */}
            <div className="space-y-2">
              <Label htmlFor="unitPrice" className="text-sm font-medium">
                Unit Price *
              </Label>
              <Input 
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                required
                value={purchaseData.unit_price}
                onChange={(e) => setPurchaseData({...purchaseData, unit_price: e.target.value})}
                className="w-full"
              />
            </div>

            {/* Purchase Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity *
              </Label>
              <Input 
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                required
                value={purchaseData.purchase_quantity}
                onChange={(e) => setPurchaseData({...purchaseData, purchase_quantity: e.target.value})}
                className="w-full"
              />
            </div>

            {/* Purchase Number (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="purchaseNumber" className="text-sm font-medium">
                Purchase Number
              </Label>
              <Input 
                id="purchaseNumber"
                type="number"
                min="0"
                value={purchaseData.purchase_number}
                onChange={(e) => setPurchaseData({...purchaseData, purchase_number: e.target.value})}
                className="w-full"
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium">
                Currency *
              </Label>
              <Select 
                value={purchaseData.currency} 
                onValueChange={(value) => setPurchaseData({...purchaseData, currency: value})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GHS">GHS (Ghana Cedis)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes
              </Label>
              <Input 
                id="notes"
                value={purchaseData.notes}
                onChange={(e) => setPurchaseData({...purchaseData, notes: e.target.value})}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Purchase"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 