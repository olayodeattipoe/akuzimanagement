import React from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2 } from 'lucide-react'

export default function InterfacesTable({ interfaces, onInterfaceClick, onEdit, onDelete }) {
     const fake_array = [{'name':'solo', 'headline':'angeli angelina', 'id': 0},{'name':'attipoe', 'headline':'angeli ', 'id': 1}]
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Headline</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {fake_array.map((item) => (
                    <TableRow key={item.id} onClick={() => onInterfaceClick(item)} className="cursor-pointer">
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.headline}</TableCell>
                        <TableCell>
                            <Button variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(item); }}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}