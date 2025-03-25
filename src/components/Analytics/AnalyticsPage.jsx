import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '@/config/constants';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { LoadingSpinner, TableLoadingState, CardLoadingState } from "@/components/ui/loading";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0.00
  });
  const [timeFilter, setTimeFilter] = useState('today');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('');
  const [serverFilter, setServerFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [date, setDate] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  const calculateOrderTotal = (containers) => {
    if (!containers || typeof containers !== 'object') {
      return 0;
    }

    try {
      return Object.entries(containers).reduce((grandTotal, [_, container]) => {
        if (!container || !container.items || !Array.isArray(container.items)) {
          return grandTotal;
        }

        // Get the container items and repeat count
        const { items = [], repeatCount = 1 } = container;
        
        // Calculate the total for this container
        const containerTotal = items.reduce((total, item) => {
          if (!item || !item.is_available) {
            return total;
          }

          let customizationTotal = 0;

          if (item.customizations && typeof item.customizations === 'object') {
            Object.entries(item.customizations).forEach(([_, optionChoices]) => {
              if (optionChoices && typeof optionChoices === 'object') {
                Object.entries(optionChoices).forEach(([_, choice]) => {
                  if (!choice || !choice.is_available) return;

                  if (item.food_type === 'PK' && choice.pricing_type === 'INC') {
                    customizationTotal += Number(choice.price) || 0;
                  } else if (choice.quantity > 0) {
                    customizationTotal += Number(choice.price) || 0;
                  }
                });
              }
            });
          }

          const quantity = Number(item.quantity) || 1;
          const basePrice = Number(item.base_price) || 0;
          const mainDishPrice = Number(item.main_dish_price) || 0;

          if (item.food_type === 'SA') {
            return total + (basePrice * quantity);
          } else if (item.food_type === 'MD' || item.food_type === 'PK') {
            if (item.pricing_type === 'INC') {
              return total + mainDishPrice + customizationTotal;
            } else {
              return total + (basePrice * quantity) + customizationTotal;
            }
          }
          return total;
        }, 0);
        
        return Number(grandTotal) + (Number(containerTotal) * (Number(repeatCount) || 1));
      }, 0);
    } catch (error) {
      console.error('Error calculating order total:', error);
      return 0;
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeFilter, paymentFilter, date]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: 'get_analytics',
        content: { 
          timeFilter,
          specificDate: date ? format(date, 'yyyy-MM-dd') : null 
        }
      });

      // Ensure we have valid data
      const allOrders = Array.isArray(response.data) ? response.data : [];
      
      // Filter orders based on payment method
      const filteredOrders = paymentFilter === 'all' 
        ? allOrders 
        : allOrders.filter(order => order.payment_method?.toLowerCase() === paymentFilter);

      setOrders(filteredOrders);

      // Calculate total sales with filtered orders - with safety checks
      const totalSales = filteredOrders.reduce((sum, order) => {
        if (!order?.containers || typeof order.containers !== 'object') return sum;
        try {
          const orderTotal = calculateOrderTotal(order.containers);
          return Number(sum) + (Number(orderTotal) || 0);
        } catch (error) {
          console.error('Error calculating order total:', error);
          return sum;
        }
      }, 0);

      setStats({
        totalOrders: filteredOrders.length,
        totalSales: Number(totalSales)
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setStats({ totalOrders: 0, totalSales: 0 });
      setOrders([]); // Ensure orders is at least an empty array
    } finally {
      setIsLoading(false);
    }
  };

  // Add safety checks to filter function
  const filteredOrders = (orders || []).filter(order => {
    try {
      const customerMatch = (order?.customer__name || 'Guest').toLowerCase().includes(customerFilter.toLowerCase());
      const serverMatch = (order?.server?.username || 'Unassigned').toLowerCase().includes(serverFilter.toLowerCase());
      const adminMatch = (order?.admin?.username || 'N/A').toLowerCase().includes(adminFilter.toLowerCase());
      return customerMatch && serverMatch && adminMatch;
    } catch (error) {
      console.error('Error filtering order:', error);
      return false;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Add safety checks to filtered stats calculation
  const filteredStats = {
    totalOrders: filteredOrders.length,
    totalSales: (filteredOrders || []).reduce((sum, order) => {
      if (!order?.containers || typeof order.containers !== 'object') return sum;
      try {
        const orderTotal = calculateOrderTotal(order.containers);
        return Number(sum) + (Number(orderTotal) || 0);
      } catch (error) {
        console.error('Error calculating filtered total:', error);
        return sum;
      }
    }, 0)
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales Analytics</h1>
        <div className="flex gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  setTimeFilter('all'); // Reset time filter when specific date is selected
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select 
            value={paymentFilter} 
            onValueChange={setPaymentFilter}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="cash">Cash Only</SelectItem>
              <SelectItem value="momo">Mobile Money Only</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={timeFilter} 
            onValueChange={(value) => {
              setTimeFilter(value);
              setDate(null); // Reset date when time filter changes
            }}
            disabled={!!date || isLoading} // Disable time filter when specific date is selected
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards - Now with loading state */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Badge variant="success">
              {isLoading ? <LoadingSpinner size="sm" /> : `GHS ${filteredStats.totalSales.toFixed(2)}`}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CardLoadingState />
            ) : (
              <>
                <div className="text-2xl font-bold">GHS {filteredStats.totalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {timeFilter === 'all' ? 'All time sales' :
                   timeFilter === 'today' ? 'Today\'s sales' :
                   timeFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
                  {date && ' for ' + format(date, "PPP")}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Badge>
              {isLoading ? <LoadingSpinner size="sm" /> : filteredStats.totalOrders}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CardLoadingState />
            ) : (
              <>
                <div className="text-2xl font-bold">{filteredStats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {timeFilter === 'all' ? 'All time orders' :
                   timeFilter === 'today' ? 'Today\'s orders' :
                   timeFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
                   {date && ' for ' + format(date, "PPP")}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Filter Customer</label>
                <Input
                  placeholder="Search customer..."
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Filter Server</label>
                <Input
                  placeholder="Search server..."
                  value={serverFilter}
                  onChange={(e) => setServerFilter(e.target.value)}
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Filter Admin</label>
                <Input
                  placeholder="Search admin..."
                  value={adminFilter}
                  onChange={(e) => setAdminFilter(e.target.value)}
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Table */}
            <div className="relative overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Server</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableLoadingState colSpan={7} message="Loading orders data..." />
                  ) : currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="h-24 text-center">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    currentOrders.map(order => (
                      <TableRow key={order.uuid}>
                        <TableCell className="font-medium">{order.uuid}</TableCell>
                        <TableCell className="capitalize">{order.customer__name || 'Guest'}</TableCell>
                        <TableCell>
                          GHS {(order?.containers ? calculateOrderTotal(order.containers) : 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="capitalize">{order.payment_method}</TableCell>
                        <TableCell className="capitalize">{order.server?.username || 'Unassigned'}</TableCell>
                        <TableCell className="capitalize">{order.admin?.username || 'N/A'}</TableCell>
                        <TableCell>{new Date(order.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination - Only show when not loading */}
              {!isLoading && filteredOrders.length > 0 && (
                <div className="mt-4 flex items-center justify-between p-2">

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                      </PaginationItem>

                      {/* First Page */}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(1)}
                          isActive={currentPage === 1}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>

                      {/* Ellipsis and pages before current */}
                      {currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {/* Pages around current page */}
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNumber = i + 1;
                        if (
                          pageNumber !== 1 &&
                          pageNumber !== totalPages &&
                          pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1
                        ) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => handlePageChange(pageNumber)}
                                isActive={currentPage === pageNumber}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      {/* Ellipsis and pages after current */}
                      {currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {/* Last Page */}
                      {totalPages > 1 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(totalPages)}
                            isActive={currentPage === totalPages}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 