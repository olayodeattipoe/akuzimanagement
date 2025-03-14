import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { API_CONFIG } from "@/config/constants";

function StockRuleModal({ product, onClose }) {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({ component: "", quantity_deducted_per_unit: 0 });
  const [availableProducts, setAvailableProducts] = useState([]);
  const[errorMessage, setErrorMessage] = useState("");
  // Fetch the existing stock rules for the product
  useEffect(() => {
    async function fetchRules() {
      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "get_stock_rules",
          content: { product_id: product.product_id },
        });
        if (response.data && Array.isArray(response.data)) {
          setRules(response.data);
        }
      } catch (error) {
        console.error("Error fetching stock rules:", error);
      }
    }
    fetchRules();
  }, [product.product_id]);

  // Fetch all available products from stock records to populate the dropdown
  useEffect(() => {
    async function fetchAvailableProducts() {
      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: "get_stocks_records",
          content: {},
        });
        if (response.data && Array.isArray(response.data)) {
          setAvailableProducts(response.data);
        }
      } catch (error) {
        console.error("Error fetching available products:", error);
      }
    }
    fetchAvailableProducts();
  }, []);

  const handleAddRule = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "add_stock_rule",
        content: { 
          product_id: product.product_id, 
          component: newRule.component, 
          quantity_deducted_per_unit: newRule.quantity_deducted_per_unit 
        },
      });
      setNewRule({ component: "", quantity_deducted_per_unit: 0 });
      // Refresh the rules list
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: "get_stock_rules",
        content: { product_id: product.product_id },
      });
      if (response.data && Array.isArray(response.data)) {
        setRules(response.data);
      }
    } catch (error) {
      console.error("Error adding stock rule:", error);
      setErrorMessage("This rule you are trying to exempt already exists")
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Stock Rules for {product.product_name}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Quantity to Deduct</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>No stock rules defined.</TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{rule.component}</TableCell>
                  <TableCell>{rule.quantity_deducted_per_unit}</TableCell>
                  <TableCell>
                    {/* Buttons for editing/deleting a rule can be added here */}
                    <Button size="small" variant="ghost">Edit</Button>
                    <Button size="small" variant="ghost">Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <form onSubmit={handleAddRule} className="space-y-4 mt-4">
          {/* Dropdown for Component selection */}
          <Select
            value={newRule.component}
            onValueChange={(value) =>
              setNewRule({ ...newRule, component: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Component" />
            </SelectTrigger>
            <SelectContent>
              {availableProducts.map((p) => (
                <SelectItem key={p.product_id} value={String(p.product_id)}>
                  {p.product_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Quantity to Deduct per Unit"
            value={newRule.quantity_deducted_per_unit}
            onChange={(e) =>
              setNewRule({ ...newRule, quantity_deducted_per_unit: Number(e.target.value) })
            }
            required
          />
          <Button type="submit">Add Rule</Button>
        </form>
        <Button variant="secondary" className="mt-4" onClick={onClose}>
          Close
        </Button>
      </DialogContent>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}      
    </Dialog>
  );
}

export default StockRuleModal;
