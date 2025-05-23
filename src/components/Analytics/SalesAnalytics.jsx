"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_CONFIG } from "@/config/constants";
import SalesRecordsView from "./SalesRecordsView";
import SalesStatsView from "./SalesStatsView";
import TopSellersView from "./TopSellersView";

export default function SalesAnalytics() {
  const [activeTab, setActiveTab] = useState("records");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Log state changes
  useEffect(() => {
    console.log('SalesAnalytics - Active Tab:', activeTab);
  }, [activeTab]);

  useEffect(() => {
    console.log('SalesAnalytics - Selected Item:', selectedItem);
  }, [selectedItem]);

  const handleItemSelect = (item) => {
    console.log('SalesAnalytics - Item Selected:', item);
    setSelectedItem(item);
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Sales Analytics</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="records">Sales Records</TabsTrigger>
          <TabsTrigger value="stats">Item Statistics</TabsTrigger>
          <TabsTrigger value="top">Top Sellers</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <Card>
            <CardContent className="pt-6">
              <SalesRecordsView 
                isLoading={isLoading}
                onItemSelect={handleItemSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardContent className="pt-6">
              <SalesStatsView 
                selectedItem={selectedItem}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top">
          <Card>
            <CardContent className="pt-6">
              <TopSellersView 
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 