"use client";

import { useMemo, useState } from "react";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type InventoryItem = {
  id: number;
  name: string;
  unit: string;
  volunteer_stock: number;
  status: string;
};

type UsageEntry = {
  quantity: number;
  unit: string;
};

type Props = {
  inventory: InventoryItem[];

  usage: {
    [key: number]: UsageEntry;
  };
  onUsageChange: (id: number, field: "quantity" | "unit", value: number | string) => void;
  onSubmit: (id: number) => void;
  onUpdateStock: (id: number, quantity: number) => void;
  loading: boolean;
};

const STATUS_STYLES: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  available: {
    label: "Available",
    badge: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
    dot: "bg-green-500",
  },
  low: {
    label: "Low stock",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    dot: "bg-amber-500",
  },
  out: {
    label: "Out of stock",
    badge: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    dot: "bg-red-500",
  },
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

const USAGE_UNITS = [
  { value: "cup", label: "Cup" },
  { value: "pack", label: "Pack" },
  { value: "piece", label: "Piece" },
  { value: "bowl", label: "Bowl" },
  { value: "plate", label: "Plate" },
  { value: "bottle", label: "Bottle" },
  { value: "sachet", label: "Sachet" },
  { value: "tin", label: "Tin" },
  { value: "kg", label: "Kg" },
  { value: "g", label: "Gram" },
  { value: "l", label: "Liter" },
  { value: "ml", label: "ml" },
  { value: "other", label: "Other" },
];

export default function InventoryTable({
  inventory,
  usage,
  onUsageChange,
  onSubmit,
  onUpdateStock,
  loading,
}: Props) {
  const [updateMode, setUpdateMode] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<string>("0");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, statusFilter]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-10">No</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Log usage</TableHead>
              <TableHead>Stock (QTY)</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell colSpan={6}>
                      <div className="h-5 w-full animate-pulse rounded bg-gray-100" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-gray-400">
                  No items match this filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item, index) => {
                const status = STATUS_STYLES[item.status] ?? STATUS_STYLES.available;
                const isEditing = updateMode === item.id;
                const entry = usage[item.id] ?? { quantity: 0, unit: "cup" };

                return (
                  <TableRow key={item.id} className={isEditing ? "align-top" : undefined}>
                    <TableCell className="text-gray-400">{index + 1}</TableCell>

                    <TableCell className="font-medium text-gray-900">
                      {item.name}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </TableCell>

                    {/* Usage: just a log, not tied to stock at all */}
                    <TableCell>
                      {item.status === "out" ? (
                        <span className="text-xs text-gray-400 italic">Unavailable</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            placeholder="0"
                            className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                            value={entry.quantity || ""}
                            onChange={(e) =>
                              onUsageChange(item.id, "quantity", Number(e.target.value))
                            }
                          />

                          <select
                            className="rounded-md border border-gray-300 px-1.5 py-1 text-xs focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                            value={entry.unit}
                            onChange={(e) =>
                              onUsageChange(item.id, "unit", e.target.value)
                            }
                          >
                            {USAGE_UNITS.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-gray-700">
                      {item.volunteer_stock}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onSubmit(item.id)}
                          disabled={item.status === "out"}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors ${
                            item.status === "out"
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-gray-900 hover:bg-gray-700"
                          }`}
                        >
                          Use
                        </button>

                        <button
                          onClick={() => {
                            if (isEditing) {
                              setUpdateMode(null);
                              return;
                            }
                            setUpdateMode(item.id);
                            setStockQuantity(String(item.volunteer_stock));
                          }}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          {isEditing ? "Cancel" : "Update"}
                        </button>
                      </div>

                      {isEditing && (
                        <div className="mt-3 w-56 justify-self-center rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div>
                            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-400">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                              value={stockQuantity}
                              onChange={(e) => setStockQuantity(e.target.value)}
                            />
                            <p className="mt-1 text-[11px] text-gray-400">
                              Status updates automatically based on quantity.
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              const finalQty = Number(stockQuantity);
                              if (Number.isNaN(finalQty) || finalQty < 0) {
                                alert("Please enter a valid quantity");
                                return;
                              }
                              onUpdateStock(item.id, finalQty);
                              setUpdateMode(null);
                            }}
                            className="w-full mt-3 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-500"
                          >
                            Save changes
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredInventory.map((item) => {
          const status =STATUS_STYLES[item.status] ?? STATUS_STYLES.available;
          const entry = usage[item.id] ?? {quantity: 0,unit: "cup",};
          const isEditing = updateMode === item.id;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              {/* Item Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">Stock: {item.volunteer_stock}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              {/* Usage */}
              <div className="mt-4">
                <label className="text-xs font-medium text-gray-500">Log Usage</label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={entry.quantity || ""}
                    onChange={(e)=>
                      onUsageChange(
                        item.id,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                    className="h-10 w-24 rounded-lg border px-3 text-sm"
                  />

                  <select
                    value={entry.unit}
                    onChange={(e)=>
                      onUsageChange(
                        item.id,
                        "unit",
                        e.target.value
                      )
                    }
                    className="h-10 flex-1 rounded-lg border px-2 text-sm"
                  >
                    {USAGE_UNITS.map((u)=>(
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>

                </div>
              </div>



              {/* Action Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2">

                <button
                  onClick={()=>onSubmit(item.id)}
                  disabled={item.status==="out"}
                  className=" h-10 rounded-lg bg-gray-900 text-sm font-medium text-white disabled:bg-gray-300 "
                >
                  Use
                </button>

                <button
                  onClick={()=>{
                    if(isEditing){
                      setUpdateMode(null);
                    }else{
                      setUpdateMode(item.id);
                      setStockQuantity(
                        String(item.volunteer_stock)
                      );
                    }
                  }}
                  className="  h-10 rounded-lg border text-sm font-medium"
                > {isEditing ? "Cancel" : "Update"}
                </button>

              </div>

              {/* Update Form */}
              {isEditing && (
                <div className=" mt-4 rounded-lg border bg-gray-50 p-3 ">
                  <label className="text-xs font-medium uppercase text-gray-400"> Update Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e)=>
                      setStockQuantity(e.target.value)
                    }
                    className=" mt-2 h-10 w-full rounded-lg border px-3 text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-400">Status will update automatically based on quantity.</p>
                  <button
                    onClick={()=>{
                      const finalQty = Number(stockQuantity);
                      if(
                        Number.isNaN(finalQty) ||
                        finalQty < 0
                      ){
                        alert("Please enter a valid quantity");
                        return;
                      }

                      onUpdateStock(
                        item.id,
                        finalQty
                      );

                      setUpdateMode(null);
                    }}
                    className=" mt-3 h-10 w-full rounded-lg bg-green-600 text-sm font-medium  text-white"> Save Changes
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}