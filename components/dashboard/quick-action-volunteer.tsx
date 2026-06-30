"use client"
import { CalendarPlus, QrCode, ClipboardList, History, Package } from "lucide-react";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import Link from "next/link"

export default function QuickActionVolunteer(){
    const Action =[
        {
            id: 1,
            title: "View Inventory",
            icon: Package,
            href: "/volunteer/inventory",
            variant: "secondary" as const
        },
        {
            id: 2,
            title: "Request Inventory",
            icon: Package,
            href: "/volunteer/request/create",
            variant: "secondary" as const
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Action.map((item) => {
                const Icon = item.icon;

            return (
                <Card key={item.id}>
                    <CardHeader>
                        <CardTitle className="flex gap-2 justify-center">
                            <Icon className="w-5 h-5"/>
                            {item.title}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        
                        <Button className = "w-full" variant={item.variant}>
                            <Link href={item.href}>
                                {item.title === "View Inventory"
                                ?"View"
                                : item.title === "Request Inventory"
                                ? "Open"
                                : ""}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            );
            })}
        </div>


    );

}