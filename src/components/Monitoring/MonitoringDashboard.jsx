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
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import OrderDetailSheet from './OrderDetailSheet';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ORDER_TYPE_CHOICES = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  on_site: 'On Site'
};

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

export default function MonitoringDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [timeFilter, setTimeFilter] = useState('today'); // 'all', 'today', 'week', 'month'
  const [customerFilter, setCustomerFilter] = useState('');
  const [serverFilter, setServerFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [timeFilter]); // Re-fetch when filter changes

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'get_dashboard_data',
        'content': { timeFilter }
      });

      if (response.data) {
        setOrders(response.data.orders);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const customerMatch = (order.customer?.name || 'Guest').toLowerCase().includes(customerFilter.toLowerCase());
    const serverMatch = (order.server?.username || 'Unassigned').toLowerCase().includes(serverFilter.toLowerCase());
    const adminMatch = (order.admin?.username || 'N/A').toLowerCase().includes(adminFilter.toLowerCase());
    const orderTypeMatch = orderTypeFilter === 'all' || order.order_type.toLowerCase() === orderTypeFilter.toLowerCase();
    return customerMatch && serverMatch && adminMatch && orderTypeMatch;
  });

  // Calculate filtered stats based on filtered orders
  const filteredStats = {
    totalOrders: filteredOrders.length,
    pendingOrders: filteredOrders.filter(order => order.status === 'unprocessed').length,
    completedOrders: filteredOrders.filter(order => order.status === 'completed').length
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Helper to log activity
  const logActivity = async (description) => {
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: 'log_activity',
        content: { description }
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  const updateOrderStatus = async (orderUuid, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: 'update_order_status',
        content: {
          order_uuid: orderUuid,
          status: newStatus
        }
      });

      if (response.data.status === 'success') {
        // Update the order in the local state
        setOrders(orders.map(order => 
          order.uuid === orderUuid 
            ? { ...order, status: newStatus }
            : order
        ));
        setIsModalOpen(false);

        // Find the order and get its name
        const order = orders.find(o => o.uuid === orderUuid);
        const orderName = order?.customer?.name || 'Unknown Customer';
        // Get the current user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        const userName = user?.first_name || user?.username || 'Unknown User';

        // Compose the activity description
        let actionText = '';
        if (newStatus === 'completed') actionText = 'marked as completed';
        else if (newStatus === 'canceled') actionText = 'canceled';
        else if (newStatus === 'unprocessed') actionText = 'marked as unprocessed';
        else actionText = `changed status to ${newStatus}`;

        const description = `${userName} ${actionText} order "${orderName}" (${orderUuid})`;

        // Log the activity
        logActivity(description);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateOrderTotal = (containers) => {
    if (!containers || typeof containers !== 'object') {
      return 0;
    }

    try {
      return Object.entries(containers).reduce((grandTotal, [_, container]) => {
        if (!container || !container.items || !Array.isArray(container.items)) {
          return grandTotal;
        }

        const { items = [], repeatCount = 1 } = container;
        
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

  return (
    <div className="px-6 space-y-6">
      <style>{tableStyles}</style>
      <div className="flex justify-between items-center">
        <CardHeader className="mt-0 top-0 space-y-0">
          <CardTitle className="text-xl font-semibold font-sans">Orders Dashboard</CardTitle>
          <CardDescription>Manage your restaurant orders.</CardDescription>
        </CardHeader>        
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              <span className="text-sm text-muted-foreground">Refreshing...</span>
            </div>
          )}
          <Select value={timeFilter} onValueChange={setTimeFilter} disabled={isLoading}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unprocessed Orders</CardTitle>
            <Badge variant="warning" className="ml-2">
              {isLoading ? <LoadingSpinner size="sm" /> : filteredStats.pendingOrders}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CardLoadingState />
            ) : (
              <>
                <div className="text-2xl font-bold">{filteredStats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Awaiting processing</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <Badge variant="success" className="ml-2">
              {isLoading ? <LoadingSpinner size="sm" /> : filteredStats.completedOrders}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CardLoadingState />
            ) : (
              <>
                <div className="text-2xl font-bold">{filteredStats.completedOrders}</div>
                <p className="text-xs text-muted-foreground">Successfully completed</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Badge className="ml-2" variant="outline">
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
                  {timeFilter === 'all' ? 'All time total' :
                    timeFilter === 'today' ? 'Today\'s total' :
                      timeFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div>
                <label className="text-sm font-medium">Order Type</label>
                <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter} disabled={isLoading}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="on_site">On Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table className="table-dividers">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-center">Order ID</TableHead>
                    <TableHead className="text-center">Customer</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Order Type</TableHead>
                    <TableHead className="text-center">Date & Time</TableHead>
                    <TableHead className="text-center">Server</TableHead>
                    <TableHead className="text-center">Admin</TableHead>
                    <TableHead className="text-center w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        <div className="flex justify-center items-center h-24">
                          <LoadingSpinner size="lg" className="mr-2" />
                          <p className="text-muted-foreground">Loading orders...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : currentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentOrders.map(order => (
                      <TableRow key={order.uuid}>
                        <TableCell className="font-medium">{order.uuid}</TableCell>
                        <TableCell className="capitalize">{order.customer?.name || 'Guest'}</TableCell>
                        <TableCell className="text-center capitalize text-emerald-500">
                          <Badge className={order.status === 'completed' ? 'bg-emerald-500 text-emerald-50' :
                            order.status === 'unprocessed' ? 'bg-yellow-500 text-yellow-50' :
                              'bg-muted text-muted-foreground'}>
                          {order.status}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-center capitalize">
                          {ORDER_TYPE_CHOICES[order.order_type] || order.order_type}
                        </TableCell>
                        <TableCell className="text-center">
                        {new Date(order.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center capitalize">
                          {order.server?.username || 'Unassigned'}
                        </TableCell>
                        <TableCell className="text-center capitalize">
                          {order.admin?.username || 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isUpdating}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedOrder(order);
                              setIsModalOpen(true);
                            }}>
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
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
        </CardContent>
      </Card>

      <OrderDetailSheet
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={updateOrderStatus}
        isUpdating={isUpdating}
      />
    </div>
  );
} 