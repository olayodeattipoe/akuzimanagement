import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '@/config/constants';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function POSAdminPage() {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'get_pos_admins',
      });
      if (response.data.status === 'success') {
        setAdmins(response.data.admins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'create_pos_admin',
        'content': newAdmin
      });
      
      if (response.data.status === 'success') {
        setDialogOpen(false);
        setNewAdmin({ username: '', password: '' });
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  const handleToggleStatus = async (adminId) => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'toggle_pos_admin_status',
        'content': { id: adminId }
      });
      
      if (response.data.status === 'success') {
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to deactivate this admin?')) return;
    
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'delete_pos_admin',
        'content': { id: adminId }
      });
      
      if (response.data.status === 'success') {
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  const handleResetAdminPool = async () => {
    if (!confirm('Are you sure you want to reset all admin statuses?')) return;
    
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'reset_pos_admin_pool'
      });
      
      if (response.data.status === 'success') {
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error resetting admin pool:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">POS Admin Management</h1>
        <div className="flex gap-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New POS Admin</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    required
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    required
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Add Admin</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleResetAdminPool}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Admin Pool
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active POS Admins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id} className="border-b bg-card hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">{admin.username}</td>
                    <td className="px-6 py-4">
                      <Badge variant={admin.is_active ? "success" : "secondary"}>
                        {admin.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(admin.id)}
                        >
                          {admin.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 