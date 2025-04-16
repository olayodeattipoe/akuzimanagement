"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import { InfoIcon, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

// Mock data for food categories and their items with individual percentages
const foodCategories = [
  {
    id: "products",
    title: "Products",
    percentage: 88,
    items: [
      { name: "Waakye", percentage: 92 },
      { name: "Jollof", percentage: 85 },
      { name: "Fried Rice", percentage: 90 },
      { name: "Plain Rice", percentage: 78 },
    ],
  },
  {
    id: "custom-options",
    title: "Custom Options",
    percentage: 75,
    items: [
      { name: "Eggs", percentage: 95 },
      { name: "Salad", percentage: 65 },
      { name: "Gari", percentage: 80 },
      { name: "Macroni", percentage: 70 },
      { name: "Sausage", percentage: 60 },
      { name: "Chicken", percentage: 55 },
    ],
  },
  {
    id: "transformables",
    title: "Transformables",
    percentage: 92,
    items: [
      { name: "Raw rice", percentage: 95 },
      { name: "Oil", percentage: 88 },
      { name: "Salt", percentage: 98 },
      { name: "Beans", percentage: 85 },
    ],
  },
];

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
    <div className="flex flex-col gap-[2px] justify-center">
      {[...Array(8)].map((_, i) => (
        <div key={i} className={`h-[3px] w-6 ${getColor(i, percentage)}`} />
      ))}
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

function AddTransformablesDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    name: '',
    unit: 'kg'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transformable</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name of Transformable</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter transformable name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit of Measurement</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => setFormData({ ...formData, unit: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilogram (kg)</SelectItem>
                <SelectItem value="g">Gram (g)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Transformable</Button>
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

function ItemDetailsTable({ item, isBatchMode }) {
  const [isAddIndirectOpen, setIsAddIndirectOpen] = useState(false);
  const transformables = foodCategories.find(cat => cat.id === 'transformables')?.items || [];

  return (
    <div className="mt-8 bg-white rounded-lg border">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ingredients List</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search ingredients..." 
              className="pl-9 w-[300px]"
            />
          </div>
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            onClick={() => setIsAddIndirectOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Other Indirect Products
          </Button>
        </div>
      </div>
      <AddIndirectProductDialog
        open={isAddIndirectOpen}
        onOpenChange={setIsAddIndirectOpen}
        transformables={transformables}
      />
      <div className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {isBatchMode ? (
                  <>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity Deducted Per Order</TableHead>
                    <TableHead>Total Quantity Per Bag</TableHead>
                    <TableHead>Total Number of Bags</TableHead>
                    <TableHead>Total Quantity in Units</TableHead>
                    <TableHead>Unit Measurement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity Deducted Per Order</TableHead>
                    <TableHead>Total Quantity Per Batch</TableHead>
                    <TableHead>Actions</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {isBatchMode ? (
                  <>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>0.5 kg</TableCell>
                    <TableCell>5 kg</TableCell>
                    <TableCell>300 bags</TableCell>
                    <TableCell>1500 kg</TableCell>
                    <TableCell>kg</TableCell>
                    <TableCell>
                      <Badge 
                        variant={item.percentage > 20 ? "success" : "destructive"}
                        className="bg-green-50 text-green-700 hover:bg-green-50"
                      >
                        {item.percentage > 20 ? "In Stock" : "Low Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>0.5 kg</TableCell>
                    <TableCell>5 kg</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function ItemCard({ name, percentage, onClick, isSelected }) {
  return (
    <Card 
      className={cn(
        "bg-white shadow-sm cursor-pointer transition-all",
        isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">{name}</h3>
          <CapacityIndicator percentage={percentage} />
        </div>
        <div className="text-3xl font-bold text-gray-900">{percentage}%</div>
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

export default function InventoryPage() {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockRuleDualogOpen, setIsStockRuleDialogOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    product_id: "",
    supplier_id: "",
    quantity: 0,
    unit_price: 0,
  });
  const [selectedStock, setSelectedStock] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isBatchMode, setIsBatchMode] = useState(true);
  const [isAddTransformableOpen, setIsAddTransformableOpen] = useState(false);

  // Calculate category percentages and organize items
  const getCategoryData = () => {
    const categories = {
      Products: { items: [], percentage: 0 },
      "Custom Options": { items: [], percentage: 0 },
      Transformables: { items: [], percentage: 0 }
    };

    stocks.forEach(stock => {
      const percentage = Math.round((stock.quantity_remaining / stock.quantity_received) * 100);
      const item = {
        name: stock.product_name,
        percentage,
        ...stock
      };

      // Categorize based on your existing data structure
      if (stock.category === "Products") {
        categories.Products.items.push(item);
      } else if (stock.category === "Custom Options") {
        categories["Custom Options"].items.push(item);
      } else if (stock.category === "Transformables") {
        categories.Transformables.items.push(item);
      }
    });

    // Calculate average percentage for each category
    Object.keys(categories).forEach(key => {
      const items = categories[key].items;
      if (items.length > 0) {
        categories[key].percentage = Math.round(
          items.reduce((sum, item) => sum + item.percentage, 0) / items.length
        );
      }
    });

    return categories;
  };

  useEffect(() => {
    fetchStocks();
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchStocks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "get_stocks_records",
        content: {},
      });
      if (response.data && Array.isArray(response.data)) {
        setStocks(response.data);
      } else {
        setStocks([]);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "get_products_inventory",
        content: {},
      });
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "get_suppliers",
        content: {},
      });
      if (response.data && Array.isArray(response.data)) {
        setSuppliers(response.data);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handlePurchases = async (e) => {
    e.preventDefault();
    const computedTotalCost = newPurchase.quantity * newPurchase.unit_price;
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "add_purchase",
        content: {
          product_id: newPurchase.product_id,
          supplier_id: newPurchase.supplier_id,
          quantity_purchased: newPurchase.quantity,
          total_cost: computedTotalCost,
        },
      });
      setIsDialogOpen(false);
      setNewPurchase({ product_id: "", supplier_id: "", quantity: 0, unit_price: 0 });
      fetchStocks();
    } catch (error) {
      console.error("Error adding purchase:", error);
    }
  };

  const handleEditStock = (stock) => {
    setSelectedStock(stock);
    setIsEditDialogOpen(true);
  };

  const handleStockRule = (stock) => {
    setSelectedStock(stock);
    setIsStockRuleDialogOpen(true);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedStock) return;

    const updatedStock = {
      ...selectedStock,
      quantity_remaining: Number(selectedStock.quantity_received) - Number(selectedStock.quantity_sold),
    };

    try {
      await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "update_stock",
        content: updatedStock,
      });
      setIsEditDialogOpen(false);
      fetchStocks();
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

   const handleDeleteStock = async (stockId) => {
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "delete_stock",
        content: { id: stockId },
      });
      setStocks((prev) => prev.filter((stock) => stock.id !== stockId));
    } catch (error) {
      console.error("Error deleting stock:", error);
    }
  };

  const categoryData = getCategoryData();

  // Filter items based on search query
  const filteredItems = categoryData[activeTab]?.items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="absolute inset-0 left-[240px] right-0 overflow-auto bg-white">
      <div className="min-h-full w-full">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Inventory</h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-8 py-6">
          <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="sticky top-[88px] z-40 bg-white">
              <TabsList className="w-full flex bg-transparent p-0 justify-start border-b">
                {foodCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className={cn(
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 py-3",
                      "data-[state=active]:bg-transparent hover:bg-gray-50 text-base",
                    )}
                  >
                    <CategoryTab title={category.title} percentage={category.percentage} />
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {foodCategories.map((category) => (
              <TabsContent
                key={category.id}
                value={category.id}
                className="animate-in fade-in-50 data-[state=active]:animate-in"
              >
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
                />
                <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {category.items.map((item) => (
                    <ItemCard 
                      key={item.name} 
                      name={item.name} 
                      percentage={item.percentage}
                      onClick={() => setSelectedItem(item)}
                      isSelected={selectedItem?.name === item.name}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {selectedItem && (
            <div className="mt-8">
              <div className="sticky top-[144px] z-30 bg-white py-4 border-b">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mode-toggle"
                    checked={isBatchMode}
                    onCheckedChange={setIsBatchMode}
                  />
                  <Label htmlFor="mode-toggle" className="font-medium">
                    {isBatchMode ? 'Batch Mode' : 'Individual Mode'}
                  </Label>
                </div>
              </div>

              <div className="mt-4">
                <ItemDetailsTable 
                  item={selectedItem}
                  isBatchMode={isBatchMode}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
