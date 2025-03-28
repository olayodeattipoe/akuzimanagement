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

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({
    total_registered: 0,
    with_orders: 0,
    without_orders: 0,
    average_orders_per_customer: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomersData();
  }, []);

  const fetchCustomersData = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and pagination logic
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6 p-6">
      <style>{tableStyles}</style>
      <div className="">
        <div className="flex items-end justify-end gap-2">
          {isLoading && (
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          )}
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Badge variant="outline">
              {isLoading ? <LoadingSpinner size="sm" /> : summary.total_registered}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CardLoadingState />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary.total_registered}</div>
                <p className="text-xs text-muted-foreground">Registered customers</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Badge variant="success">
              {isLoading ? <LoadingSpinner size="sm" /> : summary.with_orders}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CardLoadingState />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary.with_orders}</div>
                <p className="text-xs text-muted-foreground">Customers with orders</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Customers</CardTitle>
            <Badge variant="outline">
              {isLoading ? <LoadingSpinner size="sm" /> : summary.without_orders}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CardLoadingState />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary.without_orders}</div>
                <p className="text-xs text-muted-foreground">Customers without orders</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Orders</CardTitle>
            <Badge variant="outline">
              {isLoading ? <LoadingSpinner size="sm" /> : summary.average_orders_per_customer}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CardLoadingState />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary.average_orders_per_customer}</div>
                <p className="text-xs text-muted-foreground">Orders per customer</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border">
            <Table className="table-dividers">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center">Name</TableHead>
                  <TableHead className="text-center">Contact Info</TableHead>
                  <TableHead className="text-center">Registration Date</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-center">Total Spent</TableHead>
                  <TableHead className="text-center">Last Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableLoadingState colSpan={6} message="Loading customer data..." />
                ) : currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-24 text-center">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  currentCustomers.map(customer => (
                    <TableRow key={customer.user_id}>
                      <TableCell className="">{customer.name}</TableCell>
                      <TableCell className="">
                        <div className="text-sm">
                          <div>{customer.email}</div>
                          <div className="text-muted-foreground">{customer.phone_number}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-sm">
                          <div>Total: {customer.customer_stats.total_orders}</div>
                          <div className="text-muted-foreground">
                            Completed: {customer.customer_stats.completed_orders}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        GHS {customer.customer_stats.total_spent.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {customer.customer_stats.last_order_date ? (
                          <div className="text-sm">
                            <div>{new Date(customer.customer_stats.last_order_date).toLocaleDateString()}</div>
                            <Badge variant={
                              customer.customer_stats.last_order_status === 'completed' ? 'success' :
                              customer.customer_stats.last_order_status === 'unprocessed' ? 'warning' :
                              customer.customer_stats.last_order_status === 'cancelled' ? 'destructive' :
                              'secondary'
                            }
                            className={
                              customer.customer_stats.last_order_status === 'completed' ? 'border-green-300 bg-green-50 text-green-500 capitalize rounded-sm' :
                              customer.customer_stats.last_order_status === 'unprocessed' ? 'border-yellow-300 bg-yellow-50 text-yellow-500 capitalize rounded-sm' :
                              customer.customer_stats.last_order_status === 'cancelled' ? 'border-red-300 bg-red-50 text-red-500 capitalize rounded-sm' :
                              'border-gray-300 bg-gray-50 text-gray-500 capitalize rounded-sm'
                            }
                            >
                              {customer.customer_stats.last_order_status}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No orders</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination - Only show when not loading */}
            {!isLoading && filteredCustomers.length > 0 && (
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
    </div>
  );
} 