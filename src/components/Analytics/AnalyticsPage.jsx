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

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0.00
  });
  const [timeFilter, setTimeFilter] = useState('all');

  const calculateOrderTotal = (containers) => {
    return Object.entries(containers).reduce((grandTotal, [_, items]) => {
      const basketTotal = items.reduce((total, item) => {
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
      
      return Number(grandTotal) + Number(basketTotal);
    }, 0);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeFilter]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: 'get_analytics',
        content: { timeFilter }
      });

      const orders = Array.isArray(response.data) ? response.data : [];
      setOrders(orders);

      // Calculate total sales
      const totalSales = orders.reduce((sum, order) => {
        if (!order.containers || typeof order.containers !== 'object') {
          return sum;
        }
        const orderTotal = calculateOrderTotal(order.containers);
        return Number(sum) + Number(orderTotal);
      }, 0);

      setStats({
        totalOrders: orders.length,
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
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.uuid} className="border-b bg-card hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">{order.uuid}</td>
                    <td className="px-6 py-4">{order.customer__name || 'Guest'}</td>
                    <td className="px-6 py-4">
                      GHS {calculateOrderTotal(order.containers).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 