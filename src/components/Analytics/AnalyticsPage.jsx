import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '@/config/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

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
  const [trends, setTrends] = useState({
    sales: {
      percentage: 0,
      isUp: true
    },
    orders: {
      percentage: 0,
      isUp: true
    },
    average: {
      percentage: 0,
      isUp: true
    },
    momo: {
      percentage: 0,
      isUp: true
    }
  });

  const tableStyles = `
  .table-dividers th,
  .table-dividers td {
    border-right: 1px solid hsl(var(--border));
    border-bottom: 1px solid hsl(var(--border));
  }
  .table-dividers th:last-child,
  .table-dividers td:last-child {
    border-right: none;

  }
`;

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

      // Calculate total sales with filtered orders
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

      // Calculate trends
      const now = new Date();
      const currentPeriodOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.timestamp);
        if (timeFilter === 'today') {
          return orderDate.toDateString() === now.toDateString();
        } else if (timeFilter === 'week') {
          return (now - orderDate) <= 7 * 24 * 60 * 60 * 1000;
        } else if (timeFilter === 'month') {
          return (now - orderDate) <= 30 * 24 * 60 * 60 * 1000;
        }
        return true;
      });

      const previousPeriodOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.timestamp);
        if (timeFilter === 'today') {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          return orderDate.toDateString() === yesterday.toDateString();
        } else if (timeFilter === 'week') {
          const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
          return orderDate >= twoWeeksAgo && orderDate < new Date(now - 7 * 24 * 60 * 60 * 1000);
        } else if (timeFilter === 'month') {
          const twoMonthsAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);
          return orderDate >= twoMonthsAgo && orderDate < new Date(now - 30 * 24 * 60 * 60 * 1000);
        }
        return false;
      });

      // Calculate previous period totals
      const previousTotalSales = previousPeriodOrders.reduce((sum, order) => {
        if (!order?.containers) return sum;
        return sum + calculateOrderTotal(order.containers);
      }, 0);

      // Calculate trend percentages
      const calculateTrendPercentage = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100);
      };

      // Current period stats
      const currentStats = {
        sales: totalSales,
        orders: currentPeriodOrders.length,
        average: totalSales / currentPeriodOrders.length || 0,
        momo: (currentPeriodOrders.filter(o => o.payment_method === 'momo').length / currentPeriodOrders.length) * 100 || 0
      };

      // Previous period stats
      const previousStats = {
        sales: previousTotalSales,
        orders: previousPeriodOrders.length,
        average: previousTotalSales / previousPeriodOrders.length || 0,
        momo: (previousPeriodOrders.filter(o => o.payment_method === 'momo').length / previousPeriodOrders.length) * 100 || 0
      };

      // Update trends
      setTrends({
        sales: {
          percentage: Math.abs(calculateTrendPercentage(currentStats.sales, previousStats.sales)).toFixed(1),
          isUp: currentStats.sales >= previousStats.sales
        },
        orders: {
          percentage: Math.abs(calculateTrendPercentage(currentStats.orders, previousStats.orders)).toFixed(1),
          isUp: currentStats.orders >= previousStats.orders
        },
        average: {
          percentage: Math.abs(calculateTrendPercentage(currentStats.average, previousStats.average)).toFixed(1),
          isUp: currentStats.average >= previousStats.average
        },
        momo: {
          percentage: Math.abs(calculateTrendPercentage(currentStats.momo, previousStats.momo)).toFixed(1),
          isUp: currentStats.momo >= previousStats.momo
        }
      });

      setStats({
        totalOrders: filteredOrders.length,
        totalSales: Number(totalSales)
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setStats({ totalOrders: 0, totalSales: 0 });
      setOrders([]); // Ensure orders is at least an empty array
      setTrends({
        sales: { percentage: 0, isUp: true },
        orders: { percentage: 0, isUp: true },
        average: { percentage: 0, isUp: true },
        momo: { percentage: 0, isUp: true }
      });
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
        <div className="flex gap-4 justify-end items-end">
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
        
      {/* Stats Cards - Now with loading state */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>Total Sales</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {isLoading ? <LoadingSpinner /> : `GHS ${filteredStats.totalSales.toFixed(2)}`}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {trends.sales.isUp ? (
                  <TrendingUpIcon className="size-3" />
                ) : (
                  <TrendingDownIcon className="size-3" />
                )}
                {trends.sales.percentage}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {trends.sales.isUp ? "Trending up" : "Trending down"} this period
              {trends.sales.isUp ? (
                <TrendingUpIcon className="size-4" />
              ) : (
                <TrendingDownIcon className="size-4" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {timeFilter === 'all' ? 'All time sales' :
               timeFilter === 'today' ? 'Today\'s sales' :
               timeFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
              {date && ' for ' + format(date, "PPP")}
            </p>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {isLoading ? <LoadingSpinner /> : filteredStats.totalOrders}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {trends.orders.isUp ? (
                  <TrendingUpIcon className="size-3" />
                ) : (
                  <TrendingDownIcon className="size-3" />
                )}
                {trends.orders.percentage}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {trends.orders.isUp ? "Order volume up" : "Order volume down"}
              {trends.orders.isUp ? (
                <TrendingUpIcon className="size-4" />
              ) : (
                <TrendingDownIcon className="size-4" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to previous period
            </p>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>Average Order Value</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                `GHS ${(filteredStats.totalSales / filteredStats.totalOrders || 0).toFixed(2)}`
              )}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {trends.average.isUp ? (
                  <TrendingUpIcon className="size-3" />
                ) : (
                  <TrendingDownIcon className="size-3" />
                )}
                {trends.average.percentage}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {trends.average.isUp ? "Higher average spend" : "Lower average spend"}
              {trends.average.isUp ? (
                <TrendingUpIcon className="size-4" />
              ) : (
                <TrendingDownIcon className="size-4" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Average basket size trend
            </p>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>MoMo Payment Rate</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                `${((orders.filter(o => o.payment_method === 'momo').length / orders.length) * 100 || 0).toFixed(1)}%`
              )}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {trends.momo.isUp ? (
                  <TrendingUpIcon className="size-3" />
                ) : (
                  <TrendingDownIcon className="size-3" />
                )}
                {trends.momo.percentage}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {trends.momo.isUp ? "MoMo adoption rising" : "MoMo usage declining"}
              {trends.momo.isUp ? (
                <TrendingUpIcon className="size-4" />
              ) : (
                <TrendingDownIcon className="size-4" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Mobile Money vs Cash payments
            </p>
          </CardContent>
        </Card>
      </div>
      <ChartAreaInteractive />

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
            <div className="relative overflow-x-auto rounded-md border ">
              <style>{tableStyles}</style>
              <Table className="table-dividers">
                <TableHeader>
                  <TableRow className="bg-muted/50">
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