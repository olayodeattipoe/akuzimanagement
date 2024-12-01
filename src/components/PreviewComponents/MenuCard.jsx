import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Add01Icon, Settings01Icon } from 'hugeicons-react';

export default function MenuCard(item){
    const { name, description, image_url, price, is_available } = item.item;

    return (
        <div className={`group border rounded-xl shadow-lg overflow-hidden bg-white flex flex-col h-full relative ${!is_available ? 'opacity-50' : ''}`}>
            {!is_available && (
                <div className="absolute inset-0 bg-gray-500 bg-opacity-30 z-10 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Unavailable</span>
                </div>
            )}
            <div className="relative w-full aspect-video overflow-hidden">
                <img
                    src={image_url}
                    alt={name}
                    loading='lazy'
                    className="w-full h-full object-cover rounded-bl-2xl"
                />
            </div>
            <div className="p-3 bg-white flex-grow flex flex-col">
                <h4 className="font-medium text-gray-900 mb-2 text-sm w-full">
                    <span className="capitalize hover:text-gray-600 text-center block w-full overflow-hidden whitespace-nowrap text-ellipsis leading-normal tracking-tight">
                        {name}
                    </span>
                </h4>
                {description && (
                    <p className="text-xs text-gray-600 text-ellipsis whitespace-nowrap overflow-hidden leading-relaxed tracking-wide">
                        {description}
                    </p>
                )}
                <div className="mt-auto">
                    <span className="text-xs my-2 text-gray-500 text-center">Starting @ <span className="text-primary/90"> GHS {price}</span></span>
                </div>
            </div>
            <div className="px-1 py-1 bg-gray-50 flex justify-between items-center border-t">
                <Button variant="ghost" className="border-none focus:outline-none rounded-full p-3 m-1">
                    <Settings01Icon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" className="border-none rounded-full p-3 m-1 focus:outline-none">
                    <Add01Icon className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
