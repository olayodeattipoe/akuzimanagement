import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_CONFIG } from "@/config/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TopSellersView({ isLoading }) {
  const [topSellers, setTopSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    time_period: "all",
    category: "",
    limit: 10
  });

  // Log component mount
  useEffect(() => {
    console.log('TopSellersView - Component Mounted');
  }, []);

  // Log filter changes
  useEffect(() => {
    console.log('TopSellersView - Filters Changed:', filters);
  }, [filters]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      console.log('TopSellersView - Fetching categories...');
      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "get_category",
          content: {}
        });
        console.log('TopSellersView - Categories Response:', response.data);
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("TopSellersView - Error fetching categories:", error);
        console.error("TopSellersView - Error details:", {
          message: error.message,
          response: error.response?.data
        });
      }
    };

    fetchCategories();
  }, []);

  // Log categories when they change
  useEffect(() => {
    console.log('TopSellersView - Categories Updated:', categories);
  }, [categories]);

  // Fetch top sellers when filters change
  useEffect(() => {
    const fetchTopSellers = async () => {
      console.log('TopSellersView - Fetching top sellers with filters:', filters);
      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "get_top_sellers",
          content: {
            time_period: filters.time_period,
            category: filters.category || undefined,
            limit: filters.limit
          }
        });

        console.log('TopSellersView - Top Sellers Response:', response.data);
        if (response.data.status === "success") {
          setTopSellers(response.data.top_sellers);
        }
      } catch (error) {
        console.error("TopSellersView - Error fetching top sellers:", error);
        console.error("TopSellersView - Error details:", {
          message: error.message,
          response: error.response?.data
        });
      }
    };

    fetchTopSellers();
  }, [filters]);

  // Log top sellers when they change
  useEffect(() => {
    console.log('TopSellersView - Top Sellers Updated:', topSellers);
  }, [topSellers]);

  // Log filter changes in handlers
  const handleTimePeriodChange = (value) => {
    console.log('TopSellersView - Time Period Changed:', value);
    setFilters({ ...filters, time_period: value });
  };

  const handleCategoryChange = (value) => {
    console.log('TopSellersView - Category Changed:', value);
    setFilters({ ...filters, category: value });
  };

  const handleLimitChange = (value) => {
    console.log('TopSellersView - Limit Changed:', value);
    setFilters({ ...filters, limit: parseInt(value) });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Time Period</label>
          <Select 
            value={filters.time_period}
            onValueChange={handleTimePeriodChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select 
            value={filters.category}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Show Top</label>
          <Select 
            value={filters.limit.toString()}
            onValueChange={handleLimitChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
              <SelectItem value="50">Top 50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Sellers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity Sold</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Last Sale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading top sellers...
                  </TableCell>
                </TableRow>
              ) : topSellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No sales data found.
                  </TableCell>
                </TableRow>
              ) : (
                topSellers.map((item, index) => (
                  <TableRow key={`${item.type}-${item.id}`}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.type === 'option_choice' && (
                          <span className="text-gray-500 text-sm block">
                            {item.option_name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                          item.type === 'product'
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        )}
                      >
                        {item.type === 'product' ? 'Product' : 'Option'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.quantity_sold.toLocaleString()}</TableCell>
                    <TableCell>
                      GH₵{item.revenue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                    <TableCell>
                      {item.last_sale ? new Date(item.last_sale).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Items Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topSellers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Items with sales data
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GH₵{topSellers.reduce((sum, item) => sum + item.revenue, 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined revenue from all items
            </p>
          </CardContent>
        </Card>

        {/* Total Units Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Units Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topSellers.reduce((sum, item) => sum + item.quantity_sold, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined units from all items
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 