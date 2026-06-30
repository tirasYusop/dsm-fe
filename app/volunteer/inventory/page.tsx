"use client";

import { useState } from "react";
import { Table , TableHeader , TableBody, TableRow , TableHead, TableCell } from "@/components/ui/table"

type InventoryItem = {
  id: number;
  name: string;
  stock: number;
  unit: string;
};

type UsageRecord = {
  id: number;
  itemName: string;
  amount: number;
  unit: string;
  date: string;
};

const initialInventory: InventoryItem[] = [
  { id: 1, name: "Rice", stock: 50, unit: "kg" },
  { id: 2, name: "Cooking Oil", stock: 10, unit: "L" },
  { id: 3, name: "Milk", stock: 0, unit: "L" },
  { id: 4, name: "Instant Noodles", stock: 120, unit: "packs" },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState(initialInventory);
  const [usage, setUsage] = useState<{ [key: number]: number }>({});
  const [records, setRecords] = useState<UsageRecord[]>([]);

  const handleUsageChange = (id: number, value: number) => {
    setUsage((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

const submitUsage = (id: number) => {
  const amount = usage[id];

  if (!amount || amount <= 0) return;

  const item = inventory.find((i) => i.id === id);

  if (!item) return;

  if (amount > item.stock) {
    alert("Usage exceeds current stock");
    return;
  }

  setInventory((prev) =>
    prev.map((i) =>
      i.id === id
        ? {
            ...i,
            stock: i.stock - amount,
          }
        : i
    )
  );

  // Record usage
  setRecords((prev) => [
    ...prev,
    {
      id: Date.now(),
      itemName: item.name,
      amount,
      unit: item.unit,
      date: new Date().toLocaleString(),
    },
  ]);

  setUsage((prev) => ({
    ...prev,
    [id]: 0,
  }));
};

return (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Inventory Usage</h1>

    <p className="text-sm text-gray-500">
      Record ingredient usage for food preparation
    </p>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bil.</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead>Current Stock</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {inventory.map((item) => {
          let status = "Available";
          let color = "text-green-600";

          if (item.stock === 0) {
            status = "Out of Stock";
            color = "text-red-600";
          } else if (item.stock < 20) {
            status = "Low Stock";
            color = "text-yellow-600";
          }

          return (
            <TableRow key={item.id} >
              <TableCell className="font-medium">
                {item.id}
              </TableCell>
              <TableCell className="font-medium">
                {item.name}
              </TableCell>

              <TableCell>
                <span className={color}>
                  {status}
                </span>
              </TableCell>

              <TableCell>
                <input
                  type="number"
                  placeholder={item.unit}
                  value={usage[item.id] || ""}
                  onChange={(e) =>
                    handleUsageChange(
                      item.id,
                      Number(e.target.value)
                    )
                  }
                  className="border rounded px-2 py-1 w-28"
                />
              </TableCell>

              <TableCell>
                {item.stock} {item.unit}
              </TableCell>

              <TableCell>
                <button
                  onClick={() => submitUsage(item.id)}
                  className="bg-black text-white px-3 py-1 rounded"
                >
                  Submit
                </button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>

    <div className="mt-10">
  <h2 className="text-xl font-semibold mb-4">
    Usage History
  </h2>

  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>No</TableHead>
        <TableHead>Item</TableHead>
        <TableHead>Used</TableHead>
        <TableHead>Date</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
        {records.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-center"
            >
              No usage recorded
            </TableCell>
          </TableRow>
        ) : (
          records.map((record, index) => (
            <TableRow key={record.id}>
              <TableCell>{index + 1}</TableCell>

              <TableCell>
                {record.itemName}
              </TableCell>

              <TableCell>
                {record.amount} {record.unit}
              </TableCell>

              <TableCell>
                {record.date}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
  </div>
);
}