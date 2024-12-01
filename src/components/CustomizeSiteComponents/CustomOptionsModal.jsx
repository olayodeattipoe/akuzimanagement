import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const CustomOptionsModal = ({ productId, selectedOptions, onClose, onSave, proteins, accompaniments }) => {
  const handleOptionChange = (option, isChecked) => {
    const updatedOptions = isChecked
      ? [...selectedOptions, option]
      : selectedOptions.filter(opt => opt !== option);
    
    onSave(productId, updatedOptions);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Custom Options for Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            <h3 className="text-lg font-semibold">Proteins</h3>
            {proteins.map((protein) => (
              <Checkbox
                key={protein.id}
                checked={selectedOptions.includes(protein.id)}
                onCheckedChange={(isChecked) => handleOptionChange(protein.id, isChecked)}
              >
                {protein.name}
              </Checkbox>
            ))}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Accompaniments</h3>
            {accompaniments.map((accomp) => (
              <Checkbox
                key={accomp.id}
                checked={selectedOptions.includes(accomp.id)}
                onCheckedChange={(isChecked) => handleOptionChange(accomp.id, isChecked)}
              >
                {accomp.name}
              </Checkbox>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(productId, selectedOptions)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomOptionsModal;
