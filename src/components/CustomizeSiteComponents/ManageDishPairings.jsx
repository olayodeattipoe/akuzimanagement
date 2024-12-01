import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { LinkIcon, PlusCircle, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import axios from "axios"

export default function ManageDishPairings() {
  const [open, setOpen] = useState(false)
  const [selectedHeader, setSelectedHeader] = useState(null)
  const [headerItems, setHeaderItems] = useState([])
  const [mainDishes, setMainDishes] = useState([])
  const [pairings, setPairings] = useState({}) // { headerId: [dishId1, dishId2, ...] }

  // Fetch initial data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Fetch Headers
        const headersResult = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
          'action': 'get_custom_header',
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        setHeaderItems(headersResult.data);

        // 2. Fetch Main Dishes
        const dishesResult = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
          'action': 'get_main_dishes',
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        setMainDishes(dishesResult.data);

        // 3. Fetch Existing Pairings
        const pairingsResult = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
          'action': 'get_header_pairings',
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        // Transform pairings data into the required format: { headerId: [dishId1, dishId2, ...] }
        console.log("Pairings",pairingsResult.data)
        setPairings(pairingsResult.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAllData();
  }, []);

  const handlePairingAdd = async (dishId) => {
    if (!selectedHeader) return;

    try {
      const response = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
        'action': 'add_header_pairing',
        'content': {
          header_id: selectedHeader.id,
          dish_id: dishId
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        setPairings(prev => ({
          ...prev,
          [selectedHeader.id]: [...(prev[selectedHeader.id] || []), dishId]
        }));
      } else {
        alert('Failed to add pairing. Please try again.');
      }
    } catch (error) {
      console.error('Error adding pairing:', error);
      alert('Error adding pairing. Please try again.');
    }
  };

  const handlePairingRemove = async (dishId) => {
    if (!selectedHeader) return;

    try {
      const response = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
        'action': 'remove_header_pairing',
        'content': {
          header_id: selectedHeader.id,
          dish_id: dishId
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        setPairings(prev => ({
          ...prev,
          [selectedHeader.id]: prev[selectedHeader.id].filter(id => id !== dishId)
        }));
      } else {
        alert('Failed to remove pairing. Please try again.');
      }
    } catch (error) {
      console.error('Error removing pairing:', error);
      alert('Error removing pairing. Please try again.');
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
        Manage Header Pairings
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Header Pairings</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            {/* Left: Header Items List */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Header Items</h3>
              <ScrollArea className="h-[500px]">
                {headerItems.map(header => (
                  <div
                    key={header.id}
                    className={`p-2 rounded cursor-pointer mb-2 ${
                      selectedHeader?.id === header.id ? 'bg-primary/10' : 'hover:bg-secondary'
                    }`}
                    onClick={() => setSelectedHeader(header)}
                  >
                    <p className="font-medium">{header.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pairings[header.id]?.length || 0} dishes paired
                    </p>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* Middle: Selected Header's Current Pairings */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">
                {selectedHeader ? `Current Pairings for ${selectedHeader.name}` : 'Select a Header'}
              </h3>
              <ScrollArea className="h-[500px]">
                {selectedHeader && pairings[selectedHeader.id]?.map(dishId => {
                  const dish = mainDishes.find(d => d.id === dishId)
                  return (
                    <div key={dishId} className="flex items-center justify-between p-2 border-b">
                      <span>{dish.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePairingRemove(dishId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </ScrollArea>
            </div>

            {/* Right: Available Main Dishes */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Available Main Dishes</h3>
              <ScrollArea className="h-[500px]">
                {mainDishes.map(dish => {
                  const isPaired = selectedHeader && 
                    pairings[selectedHeader.id]?.includes(dish.id)
                  
                  return (
                    <div key={dish.id} className="flex items-center justify-between p-2 border-b">
                      <span>{dish.name}</span>
                      {!isPaired && selectedHeader && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePairingAdd(dish.id)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}