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

export default function SalesRecordsView({ isLoading, onItemSelect }) {
  const [salesRecords, setSalesRecords] = useState([]);
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

  // Fetch sales records when filters change
  useEffect(() => {
    const fetchSalesRecords = async () => {
      if (!filters.item_id) {
        console.log('SalesRecordsView - No item selected, skipping sales records fetch');
        return;
      }

      console.log('SalesRecordsView - Fetching sales records with filters:', filters);
      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "get_sales_records",
          content: {
            item_type: filters.item_type,
            item_id: filters.item_id ? parseInt(filters.item_id) : null,
            start_date: filters.start_date ? filters.start_date.toISOString() : null,
            end_date: filters.end_date ? filters.end_date.toISOString() : null
          }
        });

        console.log('SalesRecordsView - Sales Records Response:', response.data);
        if (Array.isArray(response.data)) {
          setSalesRecords(response.data);
        }
      } catch (error) {
        console.error('SalesRecordsView - Error fetching sales records:', error);
        console.error('SalesRecordsView - Error details:', {
          message: error.message,
          response: error.response?.data
        });
      }
    };

    fetchSalesRecords();
  }, [filters]);

  // Log sales records when they change
  useEffect(() => {
    console.log('SalesRecordsView - Sales Records Updated:', salesRecords);
  }, [salesRecords]);

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
    onItemSelect(item ? { ...item, type: filters.item_type } : null);
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
              <TableHead>Order ID</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading sales records...
                </TableCell>
              </TableRow>
            ) : salesRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No sales records found.
                </TableCell>
              </TableRow>
            ) : (
              salesRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell>{record.order_uuid}</TableCell>
                  <TableCell>
                    {record.item.name}
                    {record.item.type === 'option_choice' && (
                      <span className="text-gray-500 text-sm block">
                        {record.item.option_name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{record.quantity}</TableCell>
                  <TableCell>GH₵{record.unit_price.toFixed(2)}</TableCell>
                  <TableCell>GH₵{record.total_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      record.item.type === 'product' 
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    )}>
                      {record.item.type === 'product' ? 'Product' : 'Option'}
                    </span>
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