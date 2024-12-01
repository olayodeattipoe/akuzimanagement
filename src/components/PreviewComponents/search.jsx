import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Search(){
    return (
    <form className="relative mt-5 mx-4">
      <Input
        type="search"
        placeholder="Search for dishes..."
        className="pl-10 pr-20 py-2 text-xs w-full"
      />
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="absolute right-1 top-1/2 transform -translate-y-1/2"
      >
        Search
      </Button>
    </form>
  );
};
