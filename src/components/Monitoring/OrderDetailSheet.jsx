import React from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OrderDetailSheet({ order, isOpen, onClose, onUpdateStatus }) {
  if (!order) return null;

  const calculateTotalAmount = () => {
    if (!order.containers || typeof order.containers !== 'object') return 0;

    return Object.entries(order.containers).reduce((grandTotal, [_, container]) => {
      if (!container || !container.items || !Array.isArray(container.items)) {
        return grandTotal;
      }

      const { items = [], repeatCount = 1 } = container;
      
      const containerTotal = items.reduce((total, item) => {
        if (!item || !item.is_available) {
          return total;
        }

        let customizationTotal = 0;
        if (item.customizations) {
          Object.entries(item.customizations).forEach(([_, optionChoices]) => {
            Object.entries(optionChoices).forEach(([_, choice]) => {
              if (choice.is_available) {
                if (item.food_type === 'PK' && choice.pricing_type === 'INC') {
                  customizationTotal += Number(choice.price) || 0;
                } else if (choice.quantity > 0) {
                  customizationTotal += Number(choice.price) || 0;
                }
              }
            });
          });
        }

        const quantity = Number(item.quantity) || 1;
        const basePrice = Number(item.base_price) || 0;
        const mainDishPrice = Number(item.main_dish_price) || 0;

        if (item.food_type === 'SA') {
          return total + (basePrice * quantity);
        } else if (item.food_type === 'MD' || item.food_type === 'PK') {
          if (item.pricing_type === 'INC') {
            return total + mainDishPrice + customizationTotal;
          } else {
            return total + (basePrice * quantity) + customizationTotal;
          }
        }
        return total;
      }, 0);

      return Number(grandTotal) + (Number(containerTotal) * (Number(repeatCount) || 1));
    }, 0);
  };

  const handleStatusUpdate = (newStatus) => {
    onUpdateStatus(order.uuid, newStatus);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[540px] p-0"
      >
        <div className="flex-1 overflow-y-auto h-full flex flex-col">
          {/* Header */}
          <div className="flex-none border-b p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Order #{order.uuid.slice(0, 8)}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(order.timestamp).toLocaleString()}
                </p>
              </div>
          
            </div>
          </div>

          {/* Order Info */}
          <div className="p-4 bg-muted/10">
            <div className="bg-card rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Customer</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.customer?.name || 'Guest'}
                  </p>
                  {order.customer?.phone_number && (
                    <p className="text-xs text-muted-foreground">
                      {order.customer.phone_number}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Badge variant={
                    order.status === 'completed' ? 'success' :
                    order.status === 'unprocessed' ? 'warning' :
                    'default'
                  }>
                    {order.status}
                  </Badge>
                  {order.order_type && (
                    <div className="text-xs text-muted-foreground text-right">
                      {order.order_type}
                    </div>
                  )}
                  {order.location && (
                    <div className="text-xs text-muted-foreground text-right">
                      {order.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Containers */}
          <div className="divide-y">
            {order.containers && Object.entries(order.containers).map(([containerId, container]) => (
              <div key={containerId} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    Basket {parseInt(containerId) + 1}
                    {container.repeatCount > 1 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        (×{container.repeatCount})
                      </span>
                    )}
                  </h3>
                </div>

                <div className="space-y-4">
                  {container.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-muted/30 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.item_name}</h4>
                          {item.quantity > 1 && (
                            <span className="text-sm text-muted-foreground">
                              ×{item.quantity}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">
                          GHS {item.main_dish_price || item.base_price}
                        </span>
                      </div>

                      {/* Customizations */}
                      {item.customizations && Object.entries(item.customizations).map(([category, choices]) => (
                        <div key={category} className="mt-2">
                          <div className="text-sm font-medium">{category}</div>
                          {Object.entries(choices).map(([name, choice]) => 
                            choice.is_available && choice.quantity > 0 && (
                              <div key={name} className="flex justify-between text-sm text-muted-foreground">
                                <span>
                                  {name}
                                  {choice.quantity > 1 && (
                                    <span className="ml-1">×{choice.quantity}</span>
                                  )}
                                </span>
                                <span>GHS {Number(choice.price).toFixed(2)}</span>
                              </div>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex-none border-t p-4 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="text-xl font-semibold">
                GHS {calculateTotalAmount().toFixed(2)}
              </span>
            </div>

            {/* Show buttons regardless of status */}
            <div className="flex justify-end space-x-2 mt-4">
              {order.status !== 'canceled' && (
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate('canceled')}
                >
                  {order.status === 'unprocessed' ? 'Cancel Order' : 'Mark as Canceled'}
                </Button>
              )}
              {order.status !== 'completed' && (
                <Button
                  variant="default"
                  onClick={() => handleStatusUpdate('completed')}
                >
                  Mark as Completed
                </Button>
              )}
              {order.status !== 'unprocessed' && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('unprocessed')}
                >
                  Mark as Unprocessed
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 