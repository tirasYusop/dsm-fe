"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell } from "@/components/ui/table"
import Link from "next/link";

type InventoryItem = {
  id: number;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
};

const initialInventory: InventoryItem[] = [
  { id: 1, name: "Rice", stock: 50, unit: "kg", minStock: 20 },
  { id: 2, name: "Cooking Oil", stock: 16, unit: "L", minStock: 15 },
  { id: 3, name: "Milk", stock: 0, unit: "L", minStock: 10 },
  { id: 4, name: "Instant Noodles", stock: 120, unit: "packs", minStock: 30 },
];

export default function InventoryListPage() {
  const [inventory] = useState(initialInventory);

  return (
    <div className="space-y-4">

      {/* HEADER ROW */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inventory Overview</h1>
          <p className="text-sm text-gray-500">
            Manage all stock items
          </p>
        </div>
      </div>

      {/* GRID */}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {inventory.map((item) => {
              const isLowStock = item.stock <= item.minStock && item.stock > 0;
              const isOut = item.stock === 0;

              let statusText = "OK";
              let statusColor = "text-green-600";

              if (isOut) {
                statusText = "Out of Stock";
                statusColor = "text-red-600";
              } else if (isLowStock) {
                statusText = "Low Stock";
                statusColor = "text-yellow-600";
              }

              return (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {item.stock} {item.unit}
                  </TableCell>
                  <TableCell className={statusColor}>
                    {statusText}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>


      </Card>
      </div>
  );
}