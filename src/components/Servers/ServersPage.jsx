import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash, RefreshCw, MoreVertical, User, Mail, Check, X, UserRoundPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from 'axios';
import { API_CONFIG } from '@/config/constants';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ServersPage() {
  const [servers, setServers] = useState([]);
  const [newServer, setNewServer] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: 'get_servers',
        content: {}
      });
      
      // Debug the response
      console.log('Server response:', response.data);
      
      // Ensure we have an array
      const serverData = Array.isArray(response.data) ? response.data : [];
      setServers(serverData);
    } catch (error) {
      console.error('Error fetching servers:', error);
      setServers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddServer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        action: 'add_server',
        content: newServer
      });
      setIsAddDialogOpen(false);
      setNewServer({
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: '',
      });
      fetchServers();
    } catch (error) {
      console.error('Error adding server:', error);
    }
  };

  const handleDeleteServer = async (serverId) => {
    if (!confirm('Are you sure you want to delete this server?')) return;
    
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'delete_server',
        'content': { id: serverId }
      });

      if (response.data.status === 'success') {
        // Update local state by filtering out the deleted server
        setServers(prevServers => prevServers.filter(server => server.id !== serverId));
      } else {
        console.error('Failed to delete server');
      }
    } catch (error) {
      console.error('Error deleting server:', error);
    }
  };

  const handleResetServerPool = async () => {
    if (window.confirm('Are you sure you want to reset all servers to inactive?')) {
      try {
        await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          action: 'reset_server_pool',
          content: {}
        });
        fetchServers();
      } catch (error) {
        console.error('Error resetting server pool:', error);
      }
    }
  };

  // Get server initials
  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get color based on name
  const getAvatarColor = (firstName, lastName) => {
    const colors = [
      "bg-pink-100 text-pink-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-yellow-100 text-yellow-800",
      "bg-indigo-100 text-indigo-800",
      "bg-red-100 text-red-800"
    ];
    
    const name = `${firstName}${lastName}`;
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-3">
          <CardHeader>
            <CardTitle className="text-xl font-semibold font-sans">Server Management</CardTitle>
            <CardDescription>Manage your restaurant servers and their access.</CardDescription>
          </CardHeader>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white">
                <UserRoundPlus className="mr-2 h-4 w-4" />
                Add Server
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Server</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddServer} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newServer.first_name}
                      onChange={(e) => setNewServer({...newServer, first_name: e.target.value})}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newServer.last_name}
                      onChange={(e) => setNewServer({...newServer, last_name: e.target.value})}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newServer.email}
                    onChange={(e) => setNewServer({...newServer, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newServer.username}
                    onChange={(e) => setNewServer({...newServer, username: e.target.value})}
                    placeholder="Username for login"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newServer.password}
                    onChange={(e) => setNewServer({...newServer, password: e.target.value})}
                    placeholder="Password"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-2">
                  Add Server
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button 
            variant="destructive" 
            className="bg-rose-500 hover:bg-rose-600 text-white w-full sm:w-auto" 
            onClick={handleResetServerPool}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Pool
          </Button>
        </div>
      </div>


        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    <div className="mt-3">
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {servers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Servers Found</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    You haven't added any servers yet. Click "Add Server" to get started.
                  </p>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)} 
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Server
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {servers.map(server => (
                    <Card key={server.id} className={`hover:shadow-md shadow-sm border transition-all duration-200`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className={`h-12 w-12 ${getAvatarColor(server.first_name, server.last_name)}`}>
                              <AvatarFallback>{getInitials(server.first_name, server.last_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-base w-40 truncate capitalize">{`${server.first_name} ${server.last_name}`}</h3>
                              <Badge variant={server.is_active ? "success" : "secondary"} className={`mt-1 px-2 py-0 text-xs ${server.is_active ? "border-emerald-500 bg-emerald-50 text-emerald-500" : "border-red-500 bg-red-50 text-red-500"}`}>
                                {server.is_active ? <Check className={`mr-2 h-3 w-3 text-emerald-500`} /> : <X className={`mr-2 h-3 w-3 text-rose-500`} />}
                                {server.is_active ? "Active" : "Inactive"}
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
                              <DropdownMenuItem 
                                onClick={() => handleDeleteServer(server.id)}
                                className="text-red-500 focus:text-red-500 cursor-pointer mt-1"
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete Server
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <User className="mr-2 h-3.5 w-3.5" />
                            <span>{server.username}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground truncate">
                            <Mail className="mr-2 h-3.5 w-3.5" />
                            <span className="truncate">{server.email}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
    </div>
  );
} 