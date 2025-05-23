import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_CONFIG } from "@/config/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SalesRecordsView({ isLoading: parentLoading, selectedItem }) {
  const [salesRecords, setSalesRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    item_type: "product",
    item_id: "",
    start_date: null,
    end_date: null
  });
  const [products, setProducts] = useState([]);
  const [optionChoices, setOptionChoices] = useState([]);

  // Log initial mount
  useEffect(() => {
    console.log('SalesRecordsView - Component Mounted');
  }, []);

  // Log filter changes
  useEffect(() => {
    console.log('SalesRecordsView - Filters Changed:', filters);
  }, [filters]);

  // Fetch products and options for filter dropdown
  useEffect(() => {
    const fetchItems = async () => {
      console.log('SalesRecordsView - Fetching items...');
      try {
        // Fetch products
        console.log('SalesRecordsView - Fetching products...');
        const productsResponse = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "return_inventory_products",
          content: { mode: "products" }
        });
        console.log('SalesRecordsView - Products Response:', productsResponse.data);
        if (Array.isArray(productsResponse.data)) {
          setProducts(productsResponse.data);
        }

        // Fetch option choices
        console.log('SalesRecordsView - Fetching option choices...');
        const optionsResponse = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "return_inventory_products",
          content: { mode: "custom_options" }
        });
        console.log('SalesRecordsView - Option Choices Response:', optionsResponse.data);
        if (Array.isArray(optionsResponse.data)) {
          setOptionChoices(optionsResponse.data);
        }
      } catch (error) {
        console.error('SalesRecordsView - Error fetching items:', error);
        console.error('SalesRecordsView - Error details:', {
          message: error.message,
          response: error.response?.data
        });
      }
    };

    fetchItems();
  }, []);

  // Log products and options when they change
  useEffect(() => {
    console.log('SalesRecordsView - Products Updated:', products);
  }, [products]);

  useEffect(() => {
    console.log('SalesRecordsView - Option Choices Updated:', optionChoices);
  }, [optionChoices]);

  const fetchSalesRecords = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "get_sales_records",
        content: {
          item_id: selectedItem?.id || null,
          mode: "all"
        }
      });
      
      if (Array.isArray(response.data)) {
        setSalesRecords(response.data);
      } else {
        console.error("Unexpected sales records format:", response.data);
        toast.error("Failed to load sales records. Unexpected data format.");
      }
    } catch (error) {
      console.error("Error fetching sales records:", error);
      toast.error("Failed to load sales records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sales records when selectedItem changes
  useEffect(() => {
    fetchSalesRecords();
  }, [selectedItem]);

  const handleItemTypeChange = (value) => {
    console.log('SalesRecordsView - Item Type Changed:', value);
    setFilters({ ...filters, item_type: value, item_id: "" });
  };

  const handleItemSelect = (value) => {
    console.log('SalesRecordsView - Item Selected:', value);
    const item = filters.item_type === "product"
      ? products.find(p => p.id.toString() === value)
      : optionChoices.find(o => o.id.toString() === value);
    
    console.log('SalesRecordsView - Found Item:', item);
    setFilters({ ...filters, item_id: value });
  };

  const formatDate = (dateStr) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr));
  };

  const formatCurrency = (amount) => {
    return `GH₵${new Intl.NumberFormat('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)}`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Item Type</label>
          <Select 
            value={filters.item_type}
            onValueChange={handleItemTypeChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Products</SelectItem>
              <SelectItem value="option_choice">Option Choices</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Select Item</label>
          <Select
            value={filters.item_id}
            onValueChange={handleItemSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an item" />
            </SelectTrigger>
            <SelectContent>
              {filters.item_type === "product" 
                ? products.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))
                : optionChoices.map(option => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {option.name}
                    </SelectItem>
                  ))
              }
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.start_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.start_date ? format(filters.start_date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.start_date}
                onSelect={(date) => {
                  console.log('SalesRecordsView - Start Date Selected:', date);
                  setFilters({ ...filters, start_date: date });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.end_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.end_date ? format(filters.end_date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.end_date}
                onSelect={(date) => {
                  console.log('SalesRecordsView - End Date Selected:', date);
                  setFilters({ ...filters, end_date: date });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Sales Records Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || parentLoading) ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading sales records...
                </TableCell>
              </TableRow>
            ) : salesRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {selectedItem ? 
                    `No sales records found for ${selectedItem.name}` :
                    "No sales records found. Select an item to view its sales history."
                  }
                </TableCell>
              </TableRow>
            ) : (
              salesRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.sale_date)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{record.item.name}</span>
                      <span className="text-xs text-gray-500">{record.item.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{record.quantity}</TableCell>
                  <TableCell>{formatCurrency(record.unit_price)}</TableCell>
                  <TableCell>{formatCurrency(record.total_amount)}</TableCell>
                  <TableCell>{record.payment_method}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 