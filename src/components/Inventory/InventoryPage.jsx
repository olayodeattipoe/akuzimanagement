import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import StockRuleModal from "./StockRuleModal";
import { Plus, Trash2, Edit, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { API_CONFIG } from "@/config/constants";

export default function StockInventory() {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // For recording purchases
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // For editing stock records
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockRuleDualogOpen, setIsStockRuleDialogOpen] = useState(false);
  // State for recording a new purchase.
  // Updated to include supplier_id.
  const [newPurchase, setNewPurchase] = useState({
    product_id: "",
    supplier_id: "",
    quantity: 0,
    unit_price: 0,
  });
  // State for editing a stock record.
  const [selectedStock, setSelectedStock] = useState(null);
  // State for the list of products (for the dropdown)
  const [products, setProducts] = useState([]);
  // State for the list of suppliers (for the dropdown)
  const [suppliers, setSuppliers] = useState([]);

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

  // New function to fetch suppliers
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
    // Compute total cost based on quantity and unit price
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
    // Open the edit dialog and pre-fill with the selected stock data.
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

    // Compute quantity_remaining from the updated values.
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

  // Compute the total cost for display purposes
  const totalCost = newPurchase.quantity * newPurchase.unit_price;

  return (
    <div className="p-6 space-y-6">
      {/* Header and Record Purchases Dialog */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stock Records</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Purchases
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Purchase - Select Product & Supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePurchases} className="space-y-4">
              {/* Product dropdown */}
              <Select
                value={newPurchase.product_id ? String(newPurchase.product_id) : ""}
                onValueChange={(value) =>
                  setNewPurchase({ ...newPurchase, product_id: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.name} - {product.category?.name || "No Category"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Supplier dropdown */}
              <Select
                value={newPurchase.supplier_id ? String(newPurchase.supplier_id) : ""}
                onValueChange={(value) =>
                  setNewPurchase({ ...newPurchase, supplier_id: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quantity Input */}
              <Input
                type="number"
                placeholder="Quantity Purchased"
                value={newPurchase.quantity}
                onChange={(e) =>
                  setNewPurchase({ ...newPurchase, quantity: Number(e.target.value) })
                }
                required
              />
              {/* Unit Price Input */}
              <Input
                type="number"
                placeholder="Unit Price"
                value={newPurchase.unit_price}
                onChange={(e) =>
                  setNewPurchase({ ...newPurchase, unit_price: Number(e.target.value) })
                }
                required
              />
              {/* Display Computed Total Cost */}
              <p>Total Cost: ${totalCost.toFixed(2)}</p>
              <Button type="submit" className="w-full">
                Add Purchase
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Quantity Received</TableHead>
                <TableHead>Quantity Sold</TableHead>
                <TableHead>Quantity Remaining</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : stocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No stock records found
                  </TableCell>
                </TableRow>
              ) : (
                stocks.map((stock) => {
                  const totalValue = stock.unit_price
                    ? (stock.quantity_remaining * Number(stock.base_price)).toFixed(2)
                    : "0.00";
                  return (
                    <TableRow key={stock.id}>
                      <TableCell>{stock.product_name || "N/A"}</TableCell>
                      <TableCell>{stock.quantity_received}</TableCell>
                      <TableCell>{stock.quantity_sold}</TableCell>
                      <TableCell>{stock.quantity_remaining}</TableCell>
                      <TableCell>${stock.base_price}</TableCell>
                      <TableCell>${totalValue}</TableCell>
                      <TableCell>
                        <Badge variant={stock.quantity_remaining > 10 ? "success" : "destructive"}>
                          {stock.quantity_remaining > 10 ? "In Stock" : "Low Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditStock(stock)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteStock(stock.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStockRule(stock)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Stock Rule
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Stock Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <Input
              placeholder="Item Name"
              value={selectedStock?.product_name || ""}
              onChange={(e) =>
                setSelectedStock({ ...selectedStock, product_name: e.target.value })
              }
              required
            />
            <Input
              type="number"
              placeholder="Quantity Received"
              value={selectedStock?.quantity_received || ""}
              onChange={(e) =>
                setSelectedStock({ ...selectedStock, quantity_received: Number(e.target.value) })
              }
              required
            />
            <Input
              type="number"
              placeholder="Quantity Sold"
              value={selectedStock?.quantity_sold || ""}
              onChange={(e) =>
                setSelectedStock({ ...selectedStock, quantity_sold: Number(e.target.value) })
              }
              required
            />
            <Button type="submit" className="w-full">
              Update Stock
            </Button>
          </form>
        </DialogContent>
      </Dialog>


      {/* Edit Stock Dialog */
        isStockRuleDualogOpen && selectedStock && (
          <StockRuleModal product={selectedStock} onClose={() => setIsStockRuleDialogOpen(false)} />
      )}
      
    </div>
  );
}
