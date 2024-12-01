import React from 'react';
import MenuCard from './MenuCard';



export default function MenuContainer({array}){
    return (
        <div className="rounded-tr-full rounded-br-full bg-orange-50">
            <div className="rounded-tl-full rounded-bl-full bg-green-50 grid h-full grid-cols-2 gap-4 max-w-5xl mx-auto p-4">
                {array.map((item) => (
                    <MenuCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};
