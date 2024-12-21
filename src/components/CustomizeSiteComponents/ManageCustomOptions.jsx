import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; // Import Select components
import axios from 'axios';
import { Pencil, Loader2, Settings } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { API_CONFIG } from '@/config/constants'

// PricingType constants
const PricingType = {
  FIXED: 'FIX',
  INCREMENTAL: 'INC'
};

export default function ManageCustomOptions() {
  const [customHeaders, setCustomHeaders] = useState([]);
  const [customOptionData, setCustomOptionData] = useState([]);
  const [newCustomOption, setNewCustomOption] = useState({ choice_name: '', price: 0, pricing_type: PricingType.FIXED });
  const [editingOption, setEditingOption] = useState(null); // To track the option being edited
  const [newHeader, setNewHeader] = useState('');
  const [headerError, setHeaderError] = useState('');
  const [activeHeader, setActiveHeader] = useState(null); // State to track active header
  const [headerToEdit, setHeaderToEdit] = useState(null); // For editing header
  const [editHeaderData, setEditHeaderData] = useState({
    name: '',
    option_type: 'dropdown',
    is_required: false
  });
  const [isEditHeaderDialogOpen, setIsEditHeaderDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditOptionDialogOpen, setIsEditOptionDialogOpen] = useState(false);
  const [editOptionData, setEditOptionData] = useState({
    id: null,
    choice_name: '',
    price: 0,
    pricing_type: PricingType.FIXED,
    customizable_option: null
  });

  // Fetch custom headers and set active header
  useEffect(() => {
    const get_custom_header = async () => {
      try {
        const result = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          'action': 'get_custom_header',
          'content': '',
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setCustomHeaders(result.data);
        if (result.data.length > 0) {
          setActiveHeader(result.data[0].id); // Set the first header as active by default
        }
      } catch (error) {
        console.error('There was an error fetching headers!', error);
      }
    };

    get_custom_header();
  }, []);

  // Fetch custom choices for the active header
  useEffect(() => {
    if (!activeHeader) return; // Do nothing if no active header

    const get_custom_choices = async () => {
      setIsLoading(true); // Start loading
      try {
        const result = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          'action': 'get_custom_food_option',
          'content': activeHeader,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setCustomOptionData(result.data); // Set custom options data for the active header
      } catch (error) {
        console.error('There was an error fetching custom options!', error);
      } finally {
        setIsLoading(false); // Stop loading regardless of success/failure
      }
    };

    get_custom_choices();
  }, [activeHeader]); // Fetch data when activeHeader changes

  // Handle adding a new header
  const handleAddNewHeader = async () => {
    if (!newHeader.trim()) {
      setHeaderError('Header name cannot be empty');
      return;
    }

    try {
      const result = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'add_custom_header',
        'content': newHeader,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Update the local state with the new header
      setCustomHeaders(result.data);
      setNewHeader('');
      setHeaderError('');z
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  // Handle adding a new custom option for a specific header
  const handleAddCustomOption = async () => {
    const newOption = { ...newCustomOption, is_available: true, header: activeHeader };
    try {
      const result = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'add_custom_food_option',
        'content': newOption,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setNewCustomOption({ choice_name: '', price: 0, pricing_type: PricingType.FIXED }); // Reset input fields
      setCustomOptionData(result.data); // Update the custom options data
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  // Update the toggleAvailability function
  const toggleAvailability = async (optionId, currentState) => {
    try {
      const result = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'toggle_custom_food_option_availability',
        'content': {
          id: optionId,
          is_available: !currentState,
          customizable_option: activeHeader
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Update only the specific option in the state
      setCustomOptionData(prevData =>
        prevData.map(option =>
          option.id === optionId ? { ...option, is_available: !currentState } : option
        )
      );

    } catch (error) {
      console.error('Error toggling availability:', error);
      // Optionally revert the state if there's an error
      setCustomOptionData(prevData =>
        prevData.map(option =>
          option.id === optionId ? { ...option, is_available: currentState } : option
        )
      );
    }
  };

  // Handle deleting a custom option
  const handleDelete = async (optionId) => {
    try {
      const result = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'delete_custom_food_option',
        'content': {
          id: optionId,
          customizable_option: activeHeader
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Remove the deleted option from the state
      setCustomOptionData(prevData => 
        prevData.filter(option => option.id !== optionId)
      );

    } catch (error) {
      console.error('Error deleting option:', error);
      // Optionally add error handling UI feedback here
    }
  };

  // Handle editing a custom option (open the edit modal)
  const handleCustomOptionEdit = (option) => {
    setEditOptionData({
      id: option.id,
      choice_name: option.choice_name,
      price: option.price,
      pricing_type: option.pricing_type,
      customizable_option: activeHeader
    });
    setIsEditOptionDialogOpen(true);
  };

  // Handle saving the edited custom option
  const handleSaveOptionEdit = async () => {
    try {
      const result = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'edit_custom_food_option',
        'content': editOptionData,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setCustomOptionData(result.data);
      setIsEditOptionDialogOpen(false);

      setEditOptionData({
        id: null,
        choice_name: '',
        price: 0,
        pricing_type: PricingType.FIXED,
        customizable_option: null
      });

    } catch (error) {
      console.error('There was an error updating the option!', error);
    }
  };

  const handleEditHeader = (header) => {
    setHeaderToEdit(header);
    setEditHeaderData({
      id: header.id,
      name: header.name,
      option_type: header.option_type || 'dropdown',
      is_required: header.is_required || false
    });
    setIsEditHeaderDialogOpen(true);
  };

  const handleSaveHeaderEdit = async () => {
    try {
      const result = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'edit_custom_header',
        'content': editHeaderData,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Sort headers by ID before setting state
      const sortedHeaders = result.data.sort((a, b) => a.id - b.id);
      setCustomHeaders(sortedHeaders);
  
      setIsEditHeaderDialogOpen(false);
      setHeaderToEdit(null);
      setHeaderError('');
    } catch (error) {
      console.error('There was an error updating the header!', error);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Manage Custom Options
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Manage Custom Options</DialogTitle>
        </DialogHeader>

        {/* New Header Section */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="newHeader">New Header Name</Label>
              <Input
                id="newHeader"
                value={newHeader}
                onChange={(e) => setNewHeader(e.target.value)}
                placeholder="Enter new header name"
                className={headerError ? 'border-red-500' : ''} // Apply error styling
              />
              {headerError && (
                <p className="text-red-500 text-sm mt-1">{headerError}</p>
              )}
            </div>

            <Button onClick={handleAddNewHeader} className="mt-6">Add Header</Button>
          </div>
        </div>

        <div className="w-full overflow-x-auto mb-4">
          <div className="flex space-x-2 p-1 min-w-max">
            {customHeaders.map(header => (
              <div key={header.id} className="flex items-center gap-1">
                <Button
                  variant={activeHeader === header.id ? "default" : "outline"}
                  onClick={() => setActiveHeader(header.id)}
                  className="px-4 py-2 whitespace-nowrap"
                >
                  {header.name}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditHeader(header)}
                  className="p-2"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="w-full flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          customHeaders.map(header => (
            <div
              key={header.id}
              className={activeHeader === header.id ? 'block' : 'hidden'}
            >
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`customOptionName-${header.id}`}>Name</Label>
                    <Input
                      id={`customOptionName-${header.id}`}
                      value={newCustomOption.choice_name}
                      onChange={(e) => setNewCustomOption({ ...newCustomOption, choice_name: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`customOptionPrice-${header.id}`}>Price Adjustment</Label>
                    <Input
                      id={`customOptionPrice-${header.id}`}
                      type="number"
                      step="0.01"
                      value={newCustomOption.price}
                      onChange={(e) => setNewCustomOption({ ...newCustomOption, price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`customOptionPricingType-${header.id}`}>Pricing Type</Label>
                    <Select
                      value={newCustomOption.pricing_type}
                      onValueChange={(value) => setNewCustomOption({ ...newCustomOption, pricing_type: value })}
                    >
                      <SelectTrigger id={`customOptionPricingType-${header.id}`}>
                        <SelectValue placeholder="Select Pricing Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PricingType.FIXED}>Fixed</SelectItem>
                        <SelectItem value={PricingType.INCREMENTAL}>Incremental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddCustomOption} className="mt-6">Add Option</Button>
                </div>

                {/* Render custom options for this header */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price Adjustment</TableHead>
                      <TableHead>Pricing Type</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customOptionData.map(option => (
                      <TableRow key={option.id}>
                        <TableCell>{option.choice_name}</TableCell>
                        <TableCell>{option.price}</TableCell>
                        <TableCell>{option.pricing_type === PricingType.FIXED ? 'Fixed' : 'Incremental'}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Switch
                            checked={option.is_available}
                            onCheckedChange={() => toggleAvailability(option.id, option.is_available)}
                          />
                        </TableCell>
                        <TableCell className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCustomOptionEdit(option);
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(option.id);
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))
        )}

        <AlertDialog open={isEditHeaderDialogOpen} onOpenChange={setIsEditHeaderDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Header</AlertDialogTitle>
            </AlertDialogHeader>
            
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="editHeaderName">Header Name</Label>
                <Input
                  id="editHeaderName"
                  value={editHeaderData.name}
                  onChange={(e) => setEditHeaderData(prev => ({ ...prev, name: e.target.value }))}
                  className={headerError ? 'border-red-500' : ''}
                />
                {headerError && (
                  <p className="text-red-500 text-sm mt-1">{headerError}</p>
                )}
              </div>

              <div>
                <Label htmlFor="optionType">Option Type</Label>
                <Select
                  value={editHeaderData.option_type}
                  onValueChange={(value) => setEditHeaderData(prev => ({ ...prev, option_type: value }))}
                >
                  <SelectTrigger id="optionType">
                    <SelectValue placeholder="Select Option Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dropdown">Dropdown</SelectItem>
                    <SelectItem value="radio">Radio Button</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_required"
                  checked={editHeaderData.is_required}
                  onCheckedChange={(checked) => setEditHeaderData(prev => ({ ...prev, is_required: checked }))}
                />
                <Label htmlFor="is_required">Required Option</Label>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsEditHeaderDialogOpen(false);
                setHeaderError('');
                setEditHeaderData({
                  name: headerToEdit?.name || '',
                  option_type: headerToEdit?.option_type || 'dropdown',
                  is_required: headerToEdit?.is_required || false
                });
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveHeaderEdit}>
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isEditOptionDialogOpen} onOpenChange={setIsEditOptionDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Custom Option</AlertDialogTitle>
            </AlertDialogHeader>
            
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="editOptionName">Option Name</Label>
                <Input
                  id="editOptionName"
                  value={editOptionData.choice_name}
                  onChange={(e) => setEditOptionData(prev => ({ ...prev, choice_name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="editOptionPrice">Price Adjustment</Label>
                <Input
                  id="editOptionPrice"
                  type="number"
                  step="0.01"
                  value={editOptionData.price}
                  onChange={(e) => setEditOptionData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                />
              </div>

              <div>
                <Label htmlFor="editOptionPricingType">Pricing Type</Label>
                <Select
                  value={editOptionData.pricing_type}
                  onValueChange={(value) => setEditOptionData(prev => ({ ...prev, pricing_type: value }))}
                >
                  <SelectTrigger id="editOptionPricingType">
                    <SelectValue placeholder="Select Pricing Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PricingType.FIXED}>Fixed</SelectItem>
                    <SelectItem value={PricingType.INCREMENTAL}>Incremental</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editOptionHeader">Header</Label>
                <Select
                  value={editOptionData.customizable_option?.toString()}
                  onValueChange={(value) => setEditOptionData(prev => ({ 
                    ...prev, 
                    customizable_option: parseInt(value)
                  }))}
                >
                  <SelectTrigger id="editOptionHeader">
                    <SelectValue placeholder="Select Header" />
                  </SelectTrigger>
                  <SelectContent>
                    {customHeaders.map(header => (
                      <SelectItem key={header.id} value={header.id.toString()}>
                        {header.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsEditOptionDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveOptionEdit}>
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
