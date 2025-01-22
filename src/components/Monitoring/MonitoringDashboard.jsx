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

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [timeFilter]); // Re-fetch when filter changes

  const fetchDashboardData = async () => {
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
    }
  };

  const filteredOrders = orders.filter(order => {
    const customerMatch = (order.customer__name || 'Guest').toLowerCase().includes(customerFilter.toLowerCase());
    const serverMatch = (order.staff__username || 'Unassigned').toLowerCase().includes(serverFilter.toLowerCase());
    const adminMatch = (order.admin__username || 'N/A').toLowerCase().includes(adminFilter.toLowerCase());
    return customerMatch && serverMatch && adminMatch;
  });

  // Calculate filtered stats based on filtered orders
  const filteredStats = {
    totalOrders: filteredOrders.length,
    pendingOrders: filteredOrders.filter(order => order.status === 'unprocessed').length,
    completedOrders: filteredOrders.filter(order => order.status === 'completed').length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders Dashboard</h1>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
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
      
      {/* Stats Cards - Now using filteredStats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unprocessed Orders</CardTitle>
            <Badge variant="warning" className="ml-2">{filteredStats.pendingOrders}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <Badge variant="success" className="ml-2">{filteredStats.completedOrders}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Badge className="ml-2">{filteredStats.totalOrders}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {timeFilter === 'all' ? 'All time total' :
               timeFilter === 'today' ? 'Today\'s total' :
               timeFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
            </p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Filter Customer</label>
                <Input
                  placeholder="Search customer..."
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Filter Server</label>
                <Input
                  placeholder="Search server..."
                  value={serverFilter}
                  onChange={(e) => setServerFilter(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Filter Admin</label>
                <Input
                  placeholder="Search admin..."
                  value={adminFilter}
                  onChange={(e) => setAdminFilter(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Table */}
            <div className="relative overflow-x-auto rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date & Time</th>
                    <th className="px-6 py-3">Server</th>
                    <th className="px-6 py-3">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.uuid} className="border-b bg-card hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium">{order.uuid}</td>
                      <td className="px-6 py-4">{order.customer__name || 'Guest'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          order.status === 'completed' ? 'success' :
                          order.status === 'unprocessed' ? 'warning' :
                          'default'
                        }>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(order.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{order.staff__username || 'Unassigned'}</td>
                      <td className="px-6 py-4">{order.admin__username || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 