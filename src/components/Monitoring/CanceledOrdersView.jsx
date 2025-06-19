import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '@/config/constants';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CanceledOrdersView() {
  const [canceledOrders, setCanceledOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    console.log('CanceledOrdersView - Component mounted');
    fetchCanceledOrders();
  }, [startDate, endDate]);

  const fetchCanceledOrders = async () => {
    setIsLoading(true);
    console.log('CanceledOrdersView - Fetching orders with dates:', {
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null
    });

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: 'get_canceled_orders',
        content: {
          startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null,
          endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null
        }
      });

      console.log('CanceledOrdersView - API Response:', response.data);

      if (response.data.status === 'success') {
        console.log('CanceledOrdersView - Orders received:', response.data.orders);
        setCanceledOrders(response.data.orders || []);
      } else {
        console.error('CanceledOrdersView - API returned error status:', response.data);
        toast.error(response.data.message || 'Failed to load canceled orders');
      }
    } catch (error) {
      console.error('CanceledOrdersView - Error details:', {
        message: error.message,
        response: error.response?.data
      });
      toast.error('Failed to load canceled orders');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOrderTotal = (containers) => {
    if (!containers || typeof containers !== 'object') {
      console.log('CanceledOrdersView - Invalid containers:', containers);
      return 0;
    }
    
    try {
      const total = Object.entries(containers).reduce((grandTotal, [_, container]) => {
        if (!container?.items?.length) {
          console.log('CanceledOrdersView - Container has no items:', container);
          return grandTotal;
        }
        
        const containerTotal = container.items.reduce((total, item) => {
          if (!item?.is_available) {
            console.log('CanceledOrdersView - Item not available:', item);
            return total;
          }
          
          const quantity = Number(item.quantity) || 1;
          const price = Number(item.main_dish_price || item.base_price) || 0;
          const itemTotal = price * quantity;
          console.log('CanceledOrdersView - Item total:', {
            item: item.item_name,
            quantity,
            price,
            total: itemTotal
          });
          return total + itemTotal;
        }, 0);
        
        const finalTotal = containerTotal * (Number(container.repeatCount) || 1);
        console.log('CanceledOrdersView - Container total:', {
          containerTotal,
          repeatCount: container.repeatCount,
          finalTotal
        });
        return grandTotal + finalTotal;
      }, 0);

      console.log('CanceledOrdersView - Final total:', total);
      return total;
    } catch (error) {
      console.error('CanceledOrdersView - Error calculating total:', error);
      return 0;
    }
  };

  // Add debug info to the UI during development
  const debugInfo = process.env.NODE_ENV === 'development' ? (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-xs">
          {JSON.stringify({
            startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null,
            endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null,
            ordersCount: canceledOrders.length,
            isLoading,
          }, null, 2)}
        </pre>
      </CardContent>
    </Card>
  ) : null;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Canceled Orders Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {canceledOrders.length} Orders Canceled
          </div>
          <p className="text-sm text-muted-foreground">
            Total value: GHS {canceledOrders.reduce((sum, order) => 
              sum + calculateOrderTotal(order.containers), 0
            ).toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {/* Date Filters */}
      <div className="flex gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
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
                  "w-[200px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">&nbsp;</label>
          <Button 
            variant="secondary"
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
            }}
          >
            Clear Dates
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Order Type</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Payment Method</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Staff/Admin</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      Loading canceled orders...
                    </td>
                  </tr>
                ) : canceledOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      No canceled orders found for the selected period
                    </td>
                  </tr>
                ) : (
                  canceledOrders.map(order => (
                    <tr key={order.uuid} className="border-b bg-card hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium">
                        {order.uuid.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(order.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div>{order.customer.name}</div>
                          {order.customer.phone && (
                            <div className="text-xs text-muted-foreground">
                              {order.customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">
                          {order.order_type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">{order.location || 'N/A'}</td>
                      <td className="px-6 py-4">{order.payment_method}</td>
                      <td className="px-6 py-4">
                        GHS {calculateOrderTotal(order.containers).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div>{order.staff || order.admin || 'Unknown'}</div>
                          <Badge variant="secondary" className="mt-1">
                            {order.admin ? 'Admin' : order.staff ? 'Staff' : 'Unknown'}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {debugInfo}
    </div>
  );
} 