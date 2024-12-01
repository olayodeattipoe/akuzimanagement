import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import EditItems from './components/CustomizeSiteComponents/EditItems'
import axios from 'axios';
import { useToast } from "@/hooks/use-toast"


export default function CustomizeSite({ setSelectedCategory, selectedCategory, array, setControl_array }) {
    const { toast } = useToast()
    useEffect(() => {
        if (!selectedCategory) {
            console.log('No category selected')
        }
    }, [])


    const applychanges = async () => {
        try {
            const result = await axios.post('http://192.168.56.1:8000/mcc_primaryLogic/editables/', {
                'action': 'apply_changes',
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log("Server response:", result.data);
            toast({
                title: "Changes applied successfully",
                description: "Changes have been applied successfully",
            });
        } catch (error) {
            console.error('Error details:', error.response?.data || error.message);
            toast({
                title: "Error applying changes",
                description: "An error occurred while applying changes. Please try again.",
                variant: "destructive",
            });
        }
    };



    return (
        <div>
            <Button onClick={() => { applychanges(); }} className="mb-4 flex" variant="destructive">Apply Changes</Button>
            <EditItems selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} array_to_be_added={array} setarray_to_be_added={setControl_array} />
        </div>

    )
}
