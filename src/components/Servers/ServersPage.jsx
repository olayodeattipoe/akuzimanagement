import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RefreshCw } from "lucide-react";
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Servers Management</h1>
        <div className="space-x-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Server
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Server</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddServer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newServer.username}
                    onChange={(e) => setNewServer({...newServer, username: e.target.value})}
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newServer.email}
                    onChange={(e) => setNewServer({...newServer, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newServer.first_name}
                    onChange={(e) => setNewServer({...newServer, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newServer.last_name}
                    onChange={(e) => setNewServer({...newServer, last_name: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Add Server</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleResetServerPool}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Server Pool
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Servers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
                  </tr>
                ) : servers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">No servers found</td>
                  </tr>
                ) : (
                  servers.map(server => (
                    <tr key={server.id} className="border-b bg-card hover:bg-muted/50">
                      <td className="px-6 py-4">{server.username}</td>
                      <td className="px-6 py-4">{`${server.first_name} ${server.last_name}`}</td>
                      <td className="px-6 py-4">{server.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant={server.is_active ? "success" : "secondary"}>
                          {server.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteServer(server.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 