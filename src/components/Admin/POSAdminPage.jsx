import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '@/config/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, Check, X, MoreVertical, Shield, Trash, UserRoundPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar,AvatarFallback } from "@/components/ui/avatar";

export default function POSAdminPage() {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'get_pos_admins',
      });
      if (response.data.status === 'success') {
        setAdmins(response.data.admins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setIsLoading(false);
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

  // Get initials from username
  const getInitials = (name) => {
    return name.substring(0, 2).toUpperCase();
  };

  // Get random pastel color based on username
  const getAvatarColor = (username) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-amber-100 text-amber-800",
      "bg-pink-100 text-pink-800",
      "bg-cyan-100 text-cyan-800"
    ];
    
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
        <div className="flex gap-3">
          <CardHeader>
            <CardTitle className="text-xl font-semibold font-sans">POS Admin Management</CardTitle>
            <CardDescription>Manage your restaurant Point of Sale admins.</CardDescription>
          </CardHeader>
        </div>        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white">
                <UserRoundPlus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New POS Admin</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    required
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    className="mt-1"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    required
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="mt-1"
                    placeholder="Enter password"
                  />
                </div>
                <Button type="submit" className="w-full mt-2">Add Admin</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button 
            variant="destructive" 
            onClick={handleResetAdminPool} 
            className="bg-rose-500 hover:bg-rose-600 text-white relative overflow-hidden w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Pool
          </Button>
        </div>
      </div>


        <CardContent className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="bg-muted/10 border-muted/60">
                  <CardContent className="p-5">
                    <div className="flex gap-3 items-center">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Skeleton className="h-9 w-full rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {admins.map(admin => (
                <Card key={admin.id} className={`hover:shadow-md shadow-sm border transition-all duration-200`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className={`h-12 w-12 ${getAvatarColor(admin.username)}`}>
                          <AvatarFallback>{getInitials(admin.username)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-base">{admin.username}</h3>
                          <Badge variant={admin.is_active ? "success" : "secondary"} className={`mt-1 px-2 py-0 text-xs ${admin.is_active ? "border-emerald-500 bg-emerald-50 text-emerald-500" : "border-red-500 bg-red-50 text-red-500"}`}>
                            {admin.is_active ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" />} {admin.is_active ? "Active" : "Inactive"} 
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleToggleStatus(admin.id)} className="cursor-pointer">
                            {admin.is_active ? (
                              <>
                                <X className="mr-2 h-4 w-4" /> Deactivate
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" /> Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="text-red-500 focus:text-red-500 cursor-pointer"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant={admin.is_active ? "outline" : "default"}
                        size="sm"
                        className="w-full rounded-md"
                        onClick={() => handleToggleStatus(admin.id)}
                      >
                        {admin.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!isLoading && admins.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Admins Found</h3>
              <p className="text-muted-foreground mt-1 max-w-md">
                There are no POS admins registered yet. Click "Add Admin" to create your first admin account.
              </p>
              <Button 
                onClick={() => setDialogOpen(true)} 
                className="mt-4"
              >
                <UserRoundPlus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </div>
          )}
        </CardContent>
    </div>
  );
} 