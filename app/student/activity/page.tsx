"use client";

import {Card, CardHeader, CardContent, CardTitle} from "@/components/ui/card"
import {Table,TableHeader,TableHead,TableCell, TableRow, TableBody} from "@/components/ui/table"
import { Activity } from "react";


export default function ActivityPage(){
    const activities= [
        {
            id: 1,
            day: "2026-06-24",
            items: ["5 meggie","1 3in1 Coffee", "rice"],
            quantity: ["3","6", "5"]
        },
        {
            id: 2,
            day: "2026-06-25",
            items: ["2 meggie","6 3in1 Coffee", "rice"],
            quantity: ["2","3", "1"]
        },
        
        {
            id: 3,
            day: "2026-06-26",
            items: ["2 meggie","3 3in1 Coffee", "rice"],
            quantity: ["2","3", "1"]
        },
        
        {
            id: 4,
            day: "2026-06-27",
            items: ["meggi","3in1 Coffee", "rice"],
            quantity: ["1","1","1"]
        },
    ];

    return(
        <div className= "space-y-6">
            <h1 className="text-2xl font-bold">Item Usage</h1>
            {activities.map((activity)=>(
            <Card key={activity.id} >
                <CardTitle className="text-center">
                    {activity.day}
                </CardTitle>
                <Table>
                    <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead className="text-center font-semibold">
                        No.
                        </TableHead>

                        <TableHead className="text-center font-semibold">
                        Items
                        </TableHead>

                        <TableHead className="text-center font-semibold">
                        Quantity
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody className="text-center">
                        {activity.items.map((items,index)=>(
                        <TableRow  key={items}>
                            <TableCell>
                                {index}
                        </TableCell>
                        <TableCell>
                                {items}
                        </TableCell>
                            <TableCell>
                                {activity.quantity[index]}
                            </TableCell>
                        </TableRow>
                    ))}


                    </TableBody>
                </Table>
            </Card>
            ))}
        </div>
    )
}

