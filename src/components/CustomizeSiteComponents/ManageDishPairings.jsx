import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { LinkIcon, PlusCircle, Wrench, X, Loader2, Settings, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { API_CONFIG } from '@/config/constants'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

export default function ManageDishPairings() {
  const [open, setOpen] = useState(false)
  const [selectedHeader, setSelectedHeader] = useState(null)
  const [headerItems, setHeaderItems] = useState([])
  const [mainDishes, setMainDishes] = useState([])
  const [packages, setPackages] = useState([])
  const [pairings, setPairings] = useState({})
  const [activeTab, setActiveTab] = useState("maindish")
  const [isLoading, setIsLoading] = useState(true)
  const [removingPairings, setRemovingPairings] = useState({})
  const [optionSettings, setOptionSettings] = useState({})
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedPairing, setSelectedPairing] = useState(null)
  const [choiceSettings, setChoiceSettings] = useState([])
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [availableItems, setAvailableItems] = useState([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const headersResult = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          'action': 'get_custom_header',
          'content': '',
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        setHeaderItems([]);
        setMainDishes([]);
        setPackages([]);
        setPairings({});
        
        setHeaderItems(headersResult.data);
        
        const headersWithChoices = await Promise.all(
          headersResult.data.map(async (header) => {
            const choicesResult = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
              'action': 'get_custom_food_option',
              'content': header.id,
            }, {
              headers: { 'Content-Type': 'application/json' }
            });
            
            return {
              ...header,
              choices: choicesResult.data
            };
          })
        );
        
        setHeaderItems(headersWithChoices);

        const dishesResult = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          'action': 'get_main_dishes',
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        setMainDishes(dishesResult.data);

        const packagesResult = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          'action': 'get_packages',
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        setPackages(packagesResult.data);

        const pairingsResult = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          'action': 'get_header_pairings',
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        setPairings(pairingsResult.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchData();
    }

    return () => {
      setHeaderItems([]);
      setMainDishes([]);
      setPackages([]);
      setPairings({});
    };
  }, [open]);

  useEffect(() => {
    if (selectedHeader) {
        const fetchAvailableItems = async () => {
            const items = await getAvailableItems(selectedHeader.id);
            setAvailableItems(items);
        };
        fetchAvailableItems();
    }
  }, [selectedHeader, activeTab]);

  const handlePairingAdd = async (itemId) => {
    if (!selectedHeader) return;

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'add_header_pairing',
        'content': {
          header_id: selectedHeader.id,
          dish_id: itemId,
          item_type: activeTab
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        // Fetch updated pairings
        const pairingsResult = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          'action': 'get_header_pairings',
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        setPairings(pairingsResult.data);

        // Fetch updated available items
        const items = await getAvailableItems(selectedHeader.id);
        setAvailableItems(items);
      }
    } catch (error) {
      console.error('Error adding pairing:', error);
    }
  };

  const handlePairingRemove = async (itemId) => {
    if (!selectedHeader) return;

    setRemovingPairings(prev => ({ ...prev, [itemId]: true }));

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'remove_header_pairing',
        'content': {
          header_id: selectedHeader.id,
          dish_id: itemId,
          item_type: activeTab
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        // Fetch updated pairings
        const pairingsResult = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
          'action': 'get_header_pairings',
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        setPairings(pairingsResult.data);

        // Fetch updated available items
        const items = await getAvailableItems(selectedHeader.id);
        setAvailableItems(items);
      }
    } catch (error) {
      console.error('Error removing pairing:', error);
    } finally {
      setRemovingPairings(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handlePackageSettingsUpdate = async (packageId, settings) => {
    console.log('Initial settings:', settings);
    console.log('Package ID:', packageId);
    
    try {
        // Format settings and log
        const formattedSettings = {
            package_id: packageId,
            if_package_price_lock: settings.if_package_price_lock === '' ? null : 
                                 settings.if_package_price_lock,
            package_lock: Boolean(settings.package_lock)
        };

        console.log('Formatted settings being sent:', formattedSettings);

        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
            'action': 'update_package_settings',
            'content': formattedSettings
        });

        console.log('Server response:', response.data);

        if (response.data.status === 'success') {
            console.log('Updating local state with:', response.data.data);
            setAvailableItems(prevItems => {
                const newItems = prevItems.map(item => 
                    item.id === packageId 
                        ? { ...item, ...response.data.data }
                        : item
                );
                console.log('New items state:', newItems);
                return newItems;
            });
        }
    } catch (error) {
        console.error('Error updating package settings:', error);
        console.error('Error response:', error.response?.data);
    }
  };

  const handleOptionSettingsUpdate = async (productId, optionId, settings) => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'update_product_option_settings',
        'content': {
          product_id: productId,
          option_id: optionId,
          ...settings
        }
      });

      if (response.data.status === 'success') {
        setOptionSettings(prev => ({
          ...prev,
          [`${productId}-${optionId}`]: {
            ...prev[`${productId}-${optionId}`],
            ...settings
          }
        }));
      }
    } catch (error) {
      console.error('Error updating option settings:', error);
    }
  };

  const fetchOptionSettings = async (productId, optionId) => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'get_product_option_settings',
        'content': {
          product_id: productId,
          option_id: optionId
        }
      });
      
      setOptionSettings(prev => ({
        ...prev,
        [`${productId}-${optionId}`]: response.data
      }));
    } catch (error) {
      console.error('Error fetching option settings:', error);
    }
  };

  const fetchChoiceSettings = async (productId, optionId) => {
    setIsLoadingSettings(true)
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'get_product_option_settings',
        'content': {
          product_id: productId,
          option_id: optionId,
        }
      }, {
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('Choice settings response:', response.data)
      setChoiceSettings(response.data)
    } catch (error) {
      console.error('Error fetching choice settings:', error)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const updateChoiceSettings = async (choiceId, settings) => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
        'action': 'update_product_option_settings',
        'content': {
          product_id: selectedPairing.productId,
          option_id: selectedPairing.optionId,
          choice_id: choiceId,
          ...settings
        }
      }, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.data.status === 'success') {
        // Update local state with the response data
        setChoiceSettings(prevSettings => 
          prevSettings.map(setting => 
            setting.choice_id === choiceId
              ? { 
                  ...setting, 
                  ...response.data.data,  // Use the nested data object
                  tempSettings: undefined  // Clear temp settings after successful update
                }
              : setting
          )
        );
      }
      
      // Refresh settings after update
      await fetchChoiceSettings(selectedPairing.productId, selectedPairing.optionId)
    } catch (error) {
      console.error('Error updating choice settings:', error)
    }
  }

  const renderLinkedItem = (itemId) => {
    const item = activeTab === "maindish" 
      ? mainDishes.find(dish => dish.id === itemId)
      : packages.find(pkg => pkg.id === itemId);

    if (!item) return null;
    
    return (
      <div className="p-4 rounded-md border">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">{item.name}</span>
          <div className="flex items-center gap-2">
            {activeTab === "package" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPairing({
                    productId: item.id,
                    optionId: selectedHeader.id,
                    productName: item.name,
                    headerName: selectedHeader.name
                  })
                  fetchChoiceSettings(item.id, selectedHeader.id)
                  setIsSettingsOpen(true)
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePairingRemove(item.id)}
              disabled={removingPairings[item.id]}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {removingPairings[item.id] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {item.description}
        </div>
        <div className="mt-2">
          <Badge variant="outline">
            ${item.base_price}
          </Badge>
        </div>
      </div>
    );
  };

  const renderAvailableItem = (item) => {
    return (
      <div className="group p-4 rounded-md border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-medium">{item.name}</span>
            <span className="text-xs text-muted-foreground ml-2">
              ({item.pricing_type})
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Wrench className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    {activeTab === "maindish" ? "Dish Settings" : "Package Settings"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {item.pricing_type === 'FIX' 
                      ? 'Configure fixed quantity and locking settings'
                      : 'Configure locking settings'
                    }
                  </p>
                  <Separator />
                </div>
                
                <div className="space-y-3">
                  <div className="grid gap-2">
                    {item.pricing_type === 'FIX' && (
                      <>
                        <Label>Quantity</Label>
                        <Input 
                          type="number"
                          value={item.tempSettings?.if_package_price_lock ?? item.if_package_price_lock ?? ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : null;
                            item.tempSettings = {
                              ...item.tempSettings || {},
                              if_package_price_lock: value,
                              package_lock: item.tempSettings?.package_lock ?? item.package_lock ?? false
                            };
                            setAvailableItems([...availableItems]);
                          }}
                          className="w-full"
                          min="0"
                          step="1"
                          placeholder="Enter quantity"
                        />
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="font-normal">
                        Lock {activeTab === "maindish" ? "Dish" : "Package"} Settings
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Prevent changes to {activeTab === "maindish" ? "dish" : "package"} configuration
                      </p>
                    </div>
                    <Switch 
                      checked={item.tempSettings?.package_lock ?? item.package_lock ?? false}
                      onCheckedChange={(checked) => {
                        item.tempSettings = {
                          ...item.tempSettings || {},
                          package_lock: checked,
                          if_package_price_lock: item.tempSettings?.if_package_price_lock ?? item.if_package_price_lock ?? ''
                        };
                        setAvailableItems([...availableItems]);
                      }}
                    />
                  </div>

                  <Button 
                    className="w-full mt-2" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.tempSettings) {
                        if (item.pricing_type === 'FIX' && item.tempSettings.if_package_price_lock === '') {
                          alert('Quantity cannot be empty for fixed pricing items');
                          return;
                        }
                        
                        handlePackageSettingsUpdate(item.id, item.tempSettings);
                        
                        item.if_package_price_lock = item.tempSettings.if_package_price_lock;
                        item.package_lock = item.tempSettings.package_lock;
                        
                        delete item.tempSettings;
                        setAvailableItems([...availableItems]);
                      }
                    }}
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-sm text-muted-foreground">
          {item.description}
        </div>
        <div className="mt-2">
          <Badge variant="outline">
            ${item.base_price}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePairingAdd(item.id)}
          className="w-full"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Link {activeTab === "maindish" ? "Dish" : "Package"}
        </Button>
      </div>
    );
  };

  const renderSettingsDialog = () => (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {selectedPairing ? 
              `Settings for ${selectedPairing.productName} - ${selectedPairing.headerName}` : 
              'Pairing Settings'
            }
          </DialogTitle>
        </DialogHeader>
        
        {isLoadingSettings ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {choiceSettings.map((choice) => {
              // Initialize tempSettings if not exists
              if (!choice.tempSettings) {
                choice.tempSettings = {
                  if_package_price_lock: choice.if_package_price_lock,
                  package_lock: choice.package_lock
                };
              }
              
              return (
                <Card key={choice.choice_id}>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header section */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{choice.choice_name}</h4>
                          <span className="text-xs text-muted-foreground">
                            Pricing Type: {choice.pricing_type}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      {/* Settings section */}
                      <div className="space-y-4">
                        {choice.pricing_type === 'FIX' && (
                          <div className="space-y-2">
                            <Label>Fixed Quantity</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={choice.if_package_price_lock || ''}
                                onChange={(e) => {
                                  const value = e.target.value ? parseInt(e.target.value) : null;
                                  setChoiceSettings(prevSettings => 
                                    prevSettings.map(setting => 
                                      setting.choice_id === choice.choice_id
                                        ? { 
                                            ...setting, 
                                            if_package_price_lock: value,
                                            tempSettings: {
                                              ...setting.tempSettings,
                                              if_package_price_lock: value,
                                              package_lock: setting.tempSettings?.package_lock ?? setting.package_lock
                                            }
                                          }
                                        : setting
                                    )
                                  );
                                }}
                                placeholder="Enter quantity"
                                className="max-w-[150px]"
                                min="0"
                              />
                              <span className="text-sm text-muted-foreground">
                                items
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Set the fixed quantity for this option
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Lock Settings</Label>
                            <p className="text-xs text-muted-foreground">
                              Prevent changes to this option's configuration
                            </p>
                          </div>
                          <Switch
                            checked={choice.package_lock || false}
                            onCheckedChange={(checked) => {
                              setChoiceSettings(prevSettings => 
                                prevSettings.map(setting => 
                                  setting.choice_id === choice.choice_id
                                    ? { 
                                        ...setting, 
                                        package_lock: checked,
                                        tempSettings: {
                                          ...setting.tempSettings,
                                          package_lock: checked,
                                          if_package_price_lock: setting.tempSettings?.if_package_price_lock ?? setting.if_package_price_lock
                                        }
                                      }
                                    : setting
                                )
                              );
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            <DialogFooter>
              <Button onClick={() => {
                // Save all changes when Done is clicked
                choiceSettings.forEach(choice => {
                  if (choice.tempSettings) {
                    updateChoiceSettings(choice.choice_id, choice.tempSettings);
                    delete choice.tempSettings;
                  }
                });
                setIsSettingsOpen(false);
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )

  const getAvailableItems = async (headerId) => {
    setIsLoadingAvailable(true);
    try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
            'action': 'get_available_items',
            'content': {
                header_id: headerId,
                item_type: activeTab
            }
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching available items:', error);
        return [];
    } finally {
        setIsLoadingAvailable(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        className="flex gap-2 items-center"
      >
        <LinkIcon className="h-4 w-4" />
        Link Dishes to Options
      </Button>

      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          // Clean up states when modal is closed
          setSelectedHeader(null);
          setHeaderItems([]);
          setMainDishes([]);
          setPackages([]);
          setPairings({});
          setActiveTab("maindish");
          setAvailableItems([]);
          setIsSettingsOpen(false);
          setSelectedPairing(null);
          setChoiceSettings([]);
          setOptionSettings({});
          setRemovingPairings({});
        }
      }}>
        <DialogContent className="max-w-6xl h-[85vh] p-0 flex flex-col">
          <div className="border-b p-6">
            <DialogHeader className="p-0">
              <DialogTitle className="text-xl font-semibold">Link Dishes to Options</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Connect dishes with their available customization options
              </p>
            </DialogHeader>
          </div>

          <div className="border-b px-6">
            <Tabs defaultValue="maindish" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="maindish">Main Dishes</TabsTrigger>
                <TabsTrigger value="package">Packages</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4 border rounded-lg">
                <div className="bg-background p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Customization Options</h3>
                      <p className="text-xs text-muted-foreground mt-1">Select an option to manage pairings</p>
                    </div>
                    <Badge variant="outline">{headerItems.length} Options</Badge>
                  </div>
                </div>
                <ScrollArea className="h-[calc(65vh-8rem)]">
                  <div className="p-2">
                    {headerItems.map(header => (
                      <div key={header.id}>
                        <HoverCard openDelay={200}>
                          <HoverCardTrigger asChild>
                            <div
                              className={`p-2.5 rounded-lg cursor-pointer mb-2 transition-all border ${
                                selectedHeader?.id === header.id 
                                  ? 'bg-primary/5 border-primary/20' 
                                  : 'hover:bg-accent border-border hover:border-border'
                              }`}
                              onClick={() => setSelectedHeader(header)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{header.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {header.option_type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                                <span>{pairings[header.id]?.length || 0} dishes</span>
                                {header.is_required && (
                                  <Badge variant="secondary">Required</Badge>
                                )}
                              </div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent side="right" align="start" className="w-60 p-3">
                            <div className="space-y-2">
                              {header.choices?.length > 0 && (
                                <div className="space-y-1.5">
                                  <p className="text-xs font-medium text-muted-foreground">Available Choices:</p>
                                  {header.choices.map(choice => (
                                    <div 
                                      key={choice.id} 
                                      className="flex items-center justify-between py-1 px-2 text-xs rounded bg-accent"
                                    >
                                      <span>{choice.choice_name}</span>
                                      <span className="text-primary">
                                        {choice.pricing_type === 'FIXED' ? '+$' : '+%'}{choice.price}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="col-span-8">
                {selectedHeader ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="border rounded-lg">
                      <div className="bg-background p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Linked {activeTab === "maindish" ? "Dishes" : "Packages"}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Currently linked</p>
                          </div>
                          <Badge variant="outline">
                            {pairings[selectedHeader.id]?.length || 0}
                          </Badge>
                        </div>
                      </div>
                      <ScrollArea className="h-[calc(65vh-8rem)]">
                        <div className="p-2">
                          {pairings[selectedHeader.id]?.map(itemId => (
                            <div key={itemId} className="mb-2">
                              {renderLinkedItem(itemId)}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="border rounded-lg">
                      <div className="bg-background p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Available {activeTab === "maindish" ? "Dishes" : "Packages"}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Ready to link</p>
                          </div>
                          <Badge variant="outline">
                            {availableItems.length}
                          </Badge>
                        </div>
                      </div>
                      <ScrollArea className="h-[calc(65vh-8rem)]">
                        <div className="p-2">
                          {isLoadingAvailable ? (
                            <div className="flex items-center justify-center h-32">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            availableItems.map(item => (
                              <div key={`available-${item.id}`} className="mb-2">
                                {renderAvailableItem(item)}
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full border rounded-lg">
                    <div className="text-center space-y-3">
                      <div className="bg-accent p-3 rounded-full inline-block">
                        <LinkIcon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium">Select a Customization Option</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Choose an option from the left panel to start managing {activeTab === "maindish" ? "dish" : "package"} pairings
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t p-4 mt-auto">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {renderSettingsDialog()}
    </>
  )
}
