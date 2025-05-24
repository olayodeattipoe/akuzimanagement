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
import { Badge } from "@/components/ui/badge";

export default function SalesRecordsView({ isLoading: parentLoading, onItemSelect }) {
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

        // Fetch option choices with their parent option names
        console.log('SalesRecordsView - Fetching option choices...');
        const optionsResponse = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "return_inventory_products",
          content: { mode: "custom_options" }
        });
        console.log('SalesRecordsView - Option Choices Response:', optionsResponse.data);
        
        if (Array.isArray(optionsResponse.data)) {
          // Add debug logging for option choice structure
          optionsResponse.data.forEach(option => {
            console.log('Option Choice Structure:', {
              id: option.id,
              choice_name: option.choice_name,
              name: option.name,
              option_name: option.option_name,
              customizable_option: option.customizable_option
            });
          });
          setOptionChoices(optionsResponse.data);
        }
      } catch (error) {
        console.error('SalesRecordsView - Error fetching items:', error);
        console.error('SalesRecordsView - Error details:', {
          message: error.message,
          response: error.response?.data
        });
        toast.error("Failed to load items. Please try again.");
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
      // Only fetch if an item is selected
      if (!filters.item_id) {
        setSalesRecords([]);
        return;
      }

      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "get_sales_records",
        content: {
          item_id: filters.item_id,
          item_type: filters.item_type,
          start_date: filters.start_date ? format(filters.start_date, 'yyyy-MM-dd') : null,
          end_date: filters.end_date ? format(filters.end_date, 'yyyy-MM-dd') : null,
          mode: "all"
        }
      });
      
      if (Array.isArray(response.data)) {
        console.log('Sales Records Data:', response.data);
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

  // Calculate totals
  const calculateTotals = () => {
    if (!salesRecords.length) return { totalQuantity: 0, totalAmount: 0, averagePrice: 0 };
    
    const totals = salesRecords.reduce((acc, record) => {
      acc.totalQuantity += record.quantity;
      acc.totalAmount += record.total_price;
      return acc;
    }, { totalQuantity: 0, totalAmount: 0 });
    
    totals.averagePrice = totals.totalAmount / totals.totalQuantity;
    return totals;
  };

  // Update useEffect to watch date filters as well
  useEffect(() => {
    fetchSalesRecords();
  }, [filters.item_id, filters.item_type, filters.start_date, filters.end_date]);

  const totals = calculateTotals();

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
    
    // Notify parent component about the selected item
    if (item) {
      onItemSelect({
        id: item.id,
        name: filters.item_type === "product" ? item.name : (item.choice_name || item.name),
        type: filters.item_type,
        total_quantity: item.total_quantity,
        base_price: item.base_price,
        option_name: filters.item_type === "option_choice" ? item.option_name : undefined
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
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
                      {option.choice_name || option.name} {option.option_name ? `(${option.option_name})` : ''}
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

      {/* Totals Section */}
      {filters.item_id && salesRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Quantity Sold</p>
            <p className="text-2xl font-bold">{totals.totalQuantity}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.totalAmount)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Average Price</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.averagePrice)}</p>
          </div>
        </div>
      )}

      {/* Sales Records Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pricing Type</TableHead>
              <TableHead>Food Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || parentLoading) ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading sales records...
                </TableCell>
              </TableRow>
            ) : salesRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  {filters.item_id ? 
                    `No sales records found for the selected item` :
                    "Select an item to view its sales history."
                  }
                </TableCell>
              </TableRow>
            ) : (
              salesRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.timestamp)}</TableCell>
                  <TableCell className="font-mono text-sm">{record.order_uuid}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{record.item.name}</span>
                      {record.item.type === 'option_choice' && record.item.option_name && (
                        <span className="text-xs text-gray-500">
                          from {record.item.option_name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        record.item.type === 'product'
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      )}
                    >
                      {record.item.type === 'product' ? 'Product' : 'Option'}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.quantity}</TableCell>
                  <TableCell>{formatCurrency(record.unit_price)}</TableCell>
                  <TableCell>{formatCurrency(record.total_price)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {record.pricing_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {record.food_type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 