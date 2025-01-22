import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '@/config/constants';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({
    total_registered: 0,
    with_orders: 0,
    without_orders: 0,
    average_orders_per_customer: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomersData();
  }, []);

  const fetchCustomersData = async () => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: 'get_customers_data'
      });

      if (response.data.status === 'success') {
        setCustomers(response.data.registered_customers);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching customers data:', error);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Badge>{summary.total_registered}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_registered}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Badge variant="success">{summary.with_orders}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.with_orders}</div>
            <p className="text-xs text-muted-foreground">Customers with orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Customers</CardTitle>
            <Badge variant="secondary">{summary.without_orders}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.without_orders}</div>
            <p className="text-xs text-muted-foreground">Customers without orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Orders</CardTitle>
            <Badge variant="outline">{summary.average_orders_per_customer}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.average_orders_per_customer}</div>
            <p className="text-xs text-muted-foreground">Orders per customer</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map(customer => (
                  <TableRow key={customer.user_id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{customer.email}</div>
                        <div className="text-muted-foreground">{customer.phone_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(customer.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Total: {customer.customer_stats.total_orders}</div>
                        <div className="text-muted-foreground">
                          Completed: {customer.customer_stats.completed_orders}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      GHS {customer.customer_stats.total_spent.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {customer.customer_stats.last_order_date ? (
                        <div className="text-sm">
                          <div>{new Date(customer.customer_stats.last_order_date).toLocaleDateString()}</div>
                          <Badge variant={
                            customer.customer_stats.last_order_status === 'completed' ? 'success' :
                            customer.customer_stats.last_order_status === 'unprocessed' ? 'warning' :
                            'secondary'
                          }>
                            {customer.customer_stats.last_order_status}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No orders</span>
                      )}
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