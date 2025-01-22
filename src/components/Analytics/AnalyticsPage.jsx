import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '@/config/constants';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0.00
  });
  const [timeFilter, setTimeFilter] = useState('today');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const calculateOrderTotal = (containers) => {
    return Object.entries(containers).reduce((grandTotal, [_, container]) => {
      // Get the container items and repeat count
      const { items, repeatCount = 1 } = container;
      
      // Calculate the total for this container
      const containerTotal = items.reduce((total, item) => {
        let customizationTotal = 0;

        if (item.customizations) {
          Object.entries(item.customizations).forEach(([_, optionChoices]) => {
            Object.entries(optionChoices).forEach(([_, choice]) => {
              if (item.food_type === 'PK' && choice.pricing_type === 'INC') {
                customizationTotal += Number(choice.price) || 0;
              } else if (choice.quantity > 0) {
                customizationTotal += Number(choice.price) || 0;
              }
            });
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
      
      // Multiply the container total by its repeat count
      return Number(grandTotal) + (Number(containerTotal) * Number(repeatCount));
    }, 0);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeFilter, paymentFilter]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: 'get_analytics',
        content: { timeFilter }
      });

      const allOrders = Array.isArray(response.data) ? response.data : [];
      
      // Filter orders based on payment method
      const filteredOrders = paymentFilter === 'all' 
        ? allOrders 
        : allOrders.filter(order => order.payment_method?.toLowerCase() === paymentFilter);

      setOrders(filteredOrders);

      // Calculate total sales with filtered orders
      const totalSales = filteredOrders.reduce((sum, order) => {
        if (!order.containers || typeof order.containers !== 'object') {
          return sum;
        }
        const orderTotal = calculateOrderTotal(order.containers);
        return Number(sum) + Number(orderTotal);
      }, 0);

      setStats({
        totalOrders: filteredOrders.length,
        totalSales: Number(totalSales)
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setStats({
        totalOrders: 0,
        totalSales: 0
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales Analytics</h1>
        <div className="flex gap-4">
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="cash">Cash Only</SelectItem>
              <SelectItem value="momo">Mobile Money Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Badge variant="success">
              GHS {typeof stats.totalSales === 'number' ? stats.totalSales.toFixed(2) : '0.00'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {stats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {timeFilter === 'all' ? 'All time sales' :
               timeFilter === 'today' ? 'Today\'s sales' :
               timeFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Badge>{stats.totalOrders}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Number of orders processed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.uuid} className="border-b bg-card hover:bg-muted/50">
                    <TableCell className="px-6 py-4 font-medium">{order.uuid}</TableCell>
                    <TableCell className="px-6 py-4">{order.customer__name || 'Guest'}</TableCell>
                    <TableCell className="px-6 py-4">
                      GHS {calculateOrderTotal(order.containers).toFixed(2)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {order.payment_method}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {new Date(order.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 