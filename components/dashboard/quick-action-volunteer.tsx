"use client";
import { Package, ClipboardList } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const actions = [
  { id: 1, title: "View Inventory", label: "View", icon: Package, href: "/volunteer/inventory", variant: "secondary" as const },
  { id: 2, title: "Request Inventory", label: "Open", icon: ClipboardList, href: "/volunteer/request/create", variant: "secondary" as const },
];

export default function QuickActionVolunteer() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="flex gap-2 justify-center">
              <item.icon className="w-5 h-5" />
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant={item.variant}>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}