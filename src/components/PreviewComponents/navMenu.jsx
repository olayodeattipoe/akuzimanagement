import React, { useState, useEffect} from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import MenuContainer from './MenuContainer';
import axios from 'axios';

export default function NavMenu({array,setarray_to_be_added,selectedCategory,setSelectedCategory}){
    const[categories, setCategories] = useState([]);
    const[selectedCategory_, setSelectedCategory_] = useState('');
    const[selfArray, setSelfArray] = useState([]);

    const sendPostRequest = async () => {
      if (selectedCategory_ === '') {
        //pass
      } else {
        try {
          const result = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
            'action': 'get_menu_contents',
            'content': { 'selectedCategory': selectedCategory_ }
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log(result.data);
          //setarray_to_be_added(result.data)
          setSelfArray(result.data)
        } catch (error) {
          console.error('There was an error!', error);
        }
      }
    };

    useEffect(() => {
        sendPostRequest(); 
      }, [selectedCategory_]);

      useEffect(()=>{
          setSelfArray(array);
          setSelectedCategory_(selectedCategory)
      },[selectedCategory,array]);

    useEffect(() => {
        const getCategory = async () => {
          try {
            const result = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
              'action': 'get_category',
            }, {
              headers: {
                'Content-Type': 'application/json',
              },
            });
    
            console.log(result.data)
            setCategories(result.data);
          } catch (error) {
            console.error('There was an error!', error);
          }
        };
    
        getCategory();
    
      }, []);


    return (
        <>
            <ScrollArea className="w-full p-4 my-4 sticky z-20 bg-white">
                <nav>
                    <div className="flex space-x-4 min-w-max">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                className={`px-2 ${selectedCategory_ === (index + 1) ? 'text-primary' : 'text-gray-400'}`}
                                onClick={() => setSelectedCategory_(index + 1)}
                            >
                                <span
                                    className={`whitespace-nowrap ${
                                        selectedCategory_ === (index + 1)
                                            ? 'text-lg font-semibold'
                                            : 'text-sm font-normal'
                                    }`}
                                    style={{
                                        display: 'inline-block',
                                        transform: `scale(${selectedCategory_ === (index + 1) ? 1.1 : 1})`,
                                    }}
                                >
                                    {typeof category === 'object' ? category.name : category}
                                </span>
                            </div>
                        ))}
                    </div>
                </nav>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
            <MenuContainer array={selfArray}/>
        </>
    );
};
