import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_CONFIG } from "@/config/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesStatsView({ selectedItem, isLoading }) {
  const [stats, setStats] = useState(null);

  // Log when component receives new selected item
  useEffect(() => {
    console.log('SalesStatsView - Selected Item Changed:', selectedItem);
  }, [selectedItem]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedItem) {
        console.log('SalesStatsView - No item selected, skipping stats fetch');
        return;
      }

      console.log('SalesStatsView - Fetching stats for item:', {
        type: selectedItem.type,
        id: selectedItem.id,
        name: selectedItem.name
      });

      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "get_sales_stats",
          content: {
            item_type: selectedItem.type,
            item_id: parseInt(selectedItem.id)
          }
        });

        console.log('SalesStatsView - Stats Response:', response.data);
        if (response.data.status === "success") {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('SalesStatsView - Error fetching stats:', error);
        console.error('SalesStatsView - Error details:', {
          message: error.message,
          response: error.response?.data
        });
      }
    };

    fetchStats();
  }, [selectedItem]);

  // Log when stats are updated
  useEffect(() => {
    console.log('SalesStatsView - Stats Updated:', stats);
  }, [stats]);

  if (!selectedItem) {
    console.log('SalesStatsView - Rendering no item selected message');
    return (
      <div className="text-center py-8 text-gray-500">
        Select an item from the Sales Records tab to view its statistics.
      </div>
    );
  }

  const chartData = [
    {
      name: "Total Sales",
      value: stats?.total_quantity_sold || 0
    },
    {
      name: "Current Stock",
      value: selectedItem.total_quantity || 0
    }
  ];

  console.log('SalesStatsView - Rendering with chart data:', chartData);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Quantity Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Quantity Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                stats?.total_quantity_sold?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total units sold to date
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
              {isLoading ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                `GH₵${stats?.total_revenue?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total revenue generated
            </p>
          </CardContent>
        </Card>

        {/* Last Sale Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Last Sale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <span className="text-gray-400">Loading...</span>
              ) : stats?.last_sale_date ? (
                new Date(stats.last_sale_date).toLocaleDateString()
              ) : (
                "No sales yet"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Date of most recent sale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Item Details */}
      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{selectedItem.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="mt-1 capitalize">{selectedItem.type.replace('_', ' ')}</p>
            </div>
            {selectedItem.type === 'option_choice' && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Option Group</h3>
                <p className="mt-1">{selectedItem.option_name}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">Current Stock</h3>
              <p className="mt-1">{selectedItem.total_quantity || 0}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Base Price</h3>
              <p className="mt-1">GH₵{selectedItem.base_price || '0.00'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 