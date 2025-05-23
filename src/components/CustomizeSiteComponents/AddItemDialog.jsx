import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from 'lucide-react'
import axios from 'axios'
import { API_CONFIG } from '@/config/constants'

export default function AddProductDialog({ categories, setarray_to_be_added }) {
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState('')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [basePrice, setBasePrice] = useState('')
    const [pricingType, setPricingType] = useState('FIX')
    const [picture, setPicture] = useState('')


    const unitOptions = ["kg", "g", "L", "mL", "pcs", "box"] // Example unit options

    const handleCategoryChange = (value) => {
        setCategory(value)
    }

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const result = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
                        'action': 'convert_to_webp',
                        'content': { 'image': reader.result }
                    });
                    setPicture(result.data.webp_image);
                } catch (error) {
                    console.error('Error converting image:', error);
                    alert('Error processing image. Please try again.');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setCategory('')
        setName('')
        setDescription('')
        setBasePrice('')
        setPricingType('FIX')
        setPicture('')
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!category || !name || !description || !basePrice) {
            alert("Please fill in all required fields");
            return;
        }

        const newProduct = {
            'name': name,
            'description': description,
            'base_price': basePrice,
            'pricing_type': pricingType,
            'is_available': true,
            'category': category,
            'image_url': picture,
        }

        const handleSend = async () => {
            try {
                const result = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
                    'action': 'add_product',
                    'content': newProduct
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                setarray_to_be_added(result.data);
                setOpen(false);
                resetForm();
            } catch (error) {
                console.error('There was an error!', error);
                alert("An error occurred while adding the product. Please try again.");
            }
        }

        handleSend()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[86vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={handleCategoryChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories && categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                    </div>

                    <div>
                        <Label htmlFor="basePrice">Base Price</Label>
                        <Input id="basePrice" type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
                    </div>

                    <div>
                        <Label htmlFor="pricingType">Pricing Type</Label>
                        <Select value={pricingType} onValueChange={setPricingType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select pricing type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FIX">Fixed</SelectItem>
                                <SelectItem value="INC">Incremental</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/**<div>
                        <Label htmlFor="maxAccompaniments">Max Accompaniments</Label>
                        <Input id="maxAccompaniments" type="number" value={maxAccompaniments} onChange={(e) => setMaxAccompaniments(e.target.value)} />
                    </div>


                    <div>
                        <Label htmlFor="unitOfMeasurement">Unit of Measurement</Label>
                        <Select value={unitOfMeasurement} onValueChange={setUnitOfMeasurement}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {unitOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="batchNumber">Batch Number (Optional)</Label>
                        <Input id="batchNumber" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
                    </div>
                       **/ }

                    <div>
                        <Label htmlFor="picture">Product Image</Label>
                        <Input id="picture" type="file" onChange={handleImageChange} accept="image/*" />
                    </div>

                    <Button type="submit">Add Product</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
