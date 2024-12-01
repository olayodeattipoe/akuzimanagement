import { Button } from "@/components/ui/button";
import { Menu01Icon,ShoppingBag01Icon} from 'hugeicons-react';
import { Badge } from "@/components/ui/badge";



export default function Header(){


  return (
    <header className="bg-white shadow-sm top-0 z-30 sticky mt-2 mx-2 rounded-md p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold">B</span>
            </div>
            <h1 className="text-xl font-bold text-primary">Bell's Kitchen</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="">
                <span>
                    <Menu01Icon className="h-4 w-4 text-black" />
                </span>
            </Button>
            <ShoppingBag01Icon className="h-4 w-4"/>
          </div>
        </div>
        <div className="mt-7 flex items-center mx-auto justify-between text-sm text-muted-foreground">
          <span className="text-primary font-medium font-mono tracking-tighter">• KNUST, Ayeduase</span>
          <Badge variant="outline" className="border-dashed text-teal-500">Open until 10 PM</Badge>
        </div>
      </div>
    </header>
  );
}