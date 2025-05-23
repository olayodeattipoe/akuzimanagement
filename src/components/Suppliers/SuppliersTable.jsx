import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";

const SuppliersTable = ({ suppliers, isLoading, onDelete, onUpdate }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    location: "",
    contact_details: ""
  });
  
  const handleEditClick = (supplier) => {
    setCurrentSupplier(supplier);
    setEditFormData({
      id: supplier.id,
      name: supplier.name,
      location: supplier.location,
      contact_details: supplier.contact_details || ""
    });
    setEditDialogOpen(true);
  };
  
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    onUpdate(editFormData);
    setEditDialogOpen(false);
  };
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Supplier Name</TableHead>
            <TableHead className="w-[200px]">Location</TableHead>
            <TableHead>Contact Details</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                Loading suppliers...
              </TableCell>
            </TableRow>
          ) : suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No suppliers found. Add a new supplier to get started.
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.location}</TableCell>
                <TableCell>{supplier.contact_details || "—"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(supplier)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(supplier.id)}>
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
      
      {/* Edit Supplier Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update the supplier information. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Supplier Name</Label>
                <Input 
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input 
                  id="edit-location"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-contact">Contact Details</Label>
                <Input 
                  id="edit-contact"
                  value={editFormData.contact_details}
                  onChange={(e) => setEditFormData({...editFormData, contact_details: e.target.value})}
                  placeholder="Phone, email, website, etc."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuppliersTable; 