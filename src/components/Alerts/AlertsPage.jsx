import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { API_CONFIG } from '@/config/constants';

const CATEGORY_MAP = {
  products: 'Products',
  'custom-options': 'Custom Options',
  transformables: 'Transformables',
};

const TAB_MAP = {
  products: 'products',
  'custom-options': 'custom-options',
  transformables: 'transformables',
};

function getStatus(percentage) {
  if (percentage === 0) return { label: 'Depleted', color: 'destructive' };
  if (percentage <= 30) return { label: 'Low Stock', color: 'warning' };
  return null;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const categories = [
          { key: 'products', mode: 'products' },
          { key: 'custom-options', mode: 'custom_options' },
          { key: 'transformables', mode: 'transformables' },
        ];
        let allAlerts = [];
        for (const cat of categories) {
          const res = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
            action: 'return_inventory_products',
            content: { mode: cat.mode },
          });
          if (Array.isArray(res.data)) {
            for (const item of res.data) {
              const percentage = (!item.total_quantity || item.total_quantity <= 0)
                ? 0
                : Math.round((item.total_quantity / item.last_received_quantity) * 100);
              const status = getStatus(percentage);
              if (status) {
                allAlerts.push({
                  ...item,
                  percentage,
                  status: status.label,
                  statusColor: status.color,
                  category: cat.key,
                });
              }
            }
          }
        }
        setAlerts(allAlerts);
      } catch (err) {
        setError('Failed to fetch inventory data.');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const handleViewInventory = (item) => {
    // Link to /inventory?tab=category&id=item.id
    navigate(`/inventory?tab=${item.category}`);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Inventory Alerts</h1>
      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : alerts.length === 0 ? (
        <div className="text-center text-green-600 py-10">No low stock or depleted items!</div>
      ) : (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
          {alerts.map((item) => (
            <Card key={item.id + item.category} className="border shadow-sm">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{item.name}</span>
                  <Badge variant="outline">{CATEGORY_MAP[item.category]}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Stock:</span>
                  <span className="font-mono font-bold">{item.percentage}%</span>
                  <Badge variant={item.statusColor === 'destructive' ? 'destructive' : 'warning'}>
                    {item.status}
                  </Badge>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => handleViewInventory(item)}>
                    View in Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
