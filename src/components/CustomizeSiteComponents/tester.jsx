import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; // Import Select components
import axios from 'axios';

// PricingType constants
const PricingType = {
  FIXED: 'FIX',
  INCREMENTAL: 'INC'
};

export default function ManageCustomOptions() {
  const [customHeaders, setCustomHeaders] = useState([]);
  const [customOptionData, setCustomOptionData] = useState([]);
  const [newCustomOption, setNewCustomOption] = useState({ name: '', price_adjustment: 0, pricing_type: PricingType.FIXED });
  const [editingOption, setEditingOption] = useState(null); // To track the option being edited
  const [newHeader, setNewHeader] = useState('');
  const [headerError, setHeaderError] = useState('');
  const [activeHeader, setActiveHeader] = useState(null); // State to track active header
  const [headerToEdit, setHeaderToEdit] = useState(null); // For editing header

  // Fetch custom headers and set active header
  useEffect(() => {
    const get_custom_header = async () => {
      try {
        const result = await axios.post('http://192.168.132.163:8000/mcc_primaryLogic/editables/', {
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
        console.error('There was an error!', error);
      }
    };

    get_custom_header();
  }, []);

  // Fetch custom choices for the active header
  useEffect(() => {
    if (!activeHeader) return; // Do nothing if no active header

    const get_custom_choices = async () => {
      try {
        const result = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
          'action': 'get_custom_food_option',
          'content': activeHeader,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setCustomOptionData(result.data);
      } catch (error) {
        console.error('There was an error!', error);
      }
    };

    get_custom_choices();
  }, [activeHeader]);

  // Handle editing a custom header (open the edit modal)
  const handleEditHeader = (header) => {
    setHeaderToEdit(header);
  };

  // Handle saving the edited custom header
  const handleSaveHeaderEdit = async () => {
    try {
      const result = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
        'action': 'edit_custom_header',
        'content': headerToEdit,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setCustomHeaders(result.data);
      setHeaderToEdit(null); // Close the modal
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Custom Options</Button>
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

        <Tabs defaultValue={activeHeader}>
          <TabsList>
            {/* Dynamically render tabs based on customHeaders */}
            {customHeaders.map(header => (
              <div className="flex items-center" key={header.id}>
                <TabsTrigger value={header.id} onClick={() => setActiveHeader(header.id)}>
                  {header.name}
                </TabsTrigger>
                <Button variant="outline" onClick={() => handleEditHeader(header)} className="ml-4">
                  Edit
                </Button>
              </div>
            ))}
          </TabsList>

          {/* Dynamically render content for each tab */}
          {customHeaders.map(header => (
            <TabsContent key={header.id} value={header.id}>
              <div className="space-y-4">
                {/* Custom Option Form for adding options */}
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
                  <Button onClick={() => handleAddCustomOption(header.id)} className="mt-6">Add Option</Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Header Modal */}
        {headerToEdit && (
          <Dialog open={true} onOpenChange={() => setHeaderToEdit(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Header</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="headerName">Header Name</Label>
                  <Input
                    id="headerName"
                    value={headerToEdit.name}
                    onChange={(e) => setHeaderToEdit({ ...headerToEdit, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="optionType">Option Type</Label>
                  <Select
                    value={headerToEdit.option_type}
                    onValueChange={(value) => setHeaderToEdit({ ...headerToEdit, option_type: value })}
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
                <div className="flex items-center gap-2">
                  <Switch
                    checked={headerToEdit.is_required}
                    onCheckedChange={() => setHeaderToEdit({ ...headerToEdit, is_required: !headerToEdit.is_required })}
                  />
                  <Label htmlFor="isRequired">Is Required</Label>
                </div>
                <Button onClick={handleSaveHeaderEdit} className="mt-6">Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
