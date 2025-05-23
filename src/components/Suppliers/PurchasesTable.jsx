import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, MoreHorizontal, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const formatCurrency = (amount) => {
  return `GH₵${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)}`;
};

const PurchasesTable = ({ purchases, suppliers, isLoading, onDelete }) => {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  
  const viewDetails = (purchase) => {
    setSelectedPurchase(purchase);
    setDetailsDialogOpen(true);
  };
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Date</TableHead>
            <TableHead className="w-[200px]">Supplier</TableHead>
            <TableHead className="w-[200px]">Item</TableHead>
            <TableHead className="w-[100px]">Quantity</TableHead>
            <TableHead className="w-[120px]">Cost</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Loading purchases...
              </TableCell>
            </TableRow>
          ) : purchases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No purchase records found.
              </TableCell>
            </TableRow>
          ) : (
            purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatDate(purchase.purchase_date)}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{purchase.supplier.name}</TableCell>
                <TableCell>
                  {purchase.item ? (
                    <div className="flex items-center">
                      <span>{purchase.item.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {purchase.item.type}
                      </Badge>
                    </div>
                  ) : (
                    "Unknown Item"
                  )}
                </TableCell>
                <TableCell>{purchase.purchase_quantity}</TableCell>
                <TableCell>{formatCurrency(purchase.total_cost)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => viewDetails(purchase)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(purchase.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Purchase Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription>
              Detailed information about this purchase record.
            </DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p>{formatDate(selectedPurchase.purchase_date)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Supplier</h3>
                  <p>{selectedPurchase.supplier.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Item</h3>
                  <div className="flex items-center">
                    <span>{selectedPurchase.item?.name || "Unknown Item"}</span>
                    {selectedPurchase.item && (
                      <Badge variant="outline" className="ml-2">
                        {selectedPurchase.item.type}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Purchase Number</h3>
                  <p>{selectedPurchase.purchase_number || "—"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Quantity</h3>
                  <p>{selectedPurchase.purchase_quantity}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Unit Price</h3>
                  <p>{formatCurrency(selectedPurchase.unit_price)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
                  <p className="font-semibold">{formatCurrency(selectedPurchase.total_cost)}</p>
                </div>
              </div>
              
              {selectedPurchase.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="mt-1 text-sm text-gray-600">{selectedPurchase.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchasesTable; 