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

type UsageRecord = {
  id: number;
  item_name: string;
  quantity: number;
  usage_unit: string;
  created_at: string;
};

type Props = {
  records: UsageRecord[];
  loading: boolean;
};

export default function UsageHistoryTable({ records, loading }: Props) {
  const [itemFilter, setItemFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const itemOptions = useMemo(() => {
    const names = new Set(records.map((r) => r.item_name));
    return Array.from(names).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (itemFilter !== "all" && r.item_name !== itemFilter) return false;

      const recordDate = r.created_at.slice(0, 10); // YYYY-MM-DD
      if (dateFrom && recordDate < dateFrom) return false;
      if (dateTo && recordDate > dateTo) return false;

      return true;
    });
  }, [records, itemFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <select
          value={itemFilter}
          onChange={(e) => setItemFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        >
          <option value="all">All items</option>
          {itemOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <span>Dari</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
          <span>To</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        {(itemFilter !== "all" || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setItemFilter("all");
              setDateFrom("");
              setDateTo("");
            }}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Mobile history cards */}
      <div className="md:hidden space-y-3">

      {
      filteredRecords.map((record)=>{ const date = new Date(record.created_at);
        return (
          <div
            key={record.id}
            className="rounded-xl border p-4 bg-white shadow-sm">
            <div className="flex justify-between">
              <p className="font-semibold">{record.item_name}</p>
              <p className="text-sm text-gray-500">{record.quantity} {record.usage_unit}</p>
            </div>
            <p className="mt-2 text-xs text-gray-400">{date.toLocaleString()}</p>
          </div>
          )})}
          </div>

        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-10">Bil.</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Kuantiti</TableHead>
                <TableHead>Tarikh</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell colSpan={4}>
                        <div className="h-5 w-full animate-pulse rounded bg-gray-100" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-sm text-gray-400">
                    No usage records match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record, index) => {
                  const date = new Date(record.created_at);
                  const dateLabel = date.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  });
                  const timeLabel = date.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="text-gray-400">{index + 1}</TableCell>

                      <TableCell className="font-medium text-gray-900">
                        {record.item_name}
                      </TableCell>

                      <TableCell className="text-gray-700">
                        {record.quantity} {record.usage_unit}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-gray-500">
                        {dateLabel}{" "}
                        <span className="text-gray-400">{timeLabel}</span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
    </div>
  );
}