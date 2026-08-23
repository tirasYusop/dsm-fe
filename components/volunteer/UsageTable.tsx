"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import PaginationControls from "@/components/common/PaginationControls";
import type { UsageRecord } from "@/types/kitchen";

type Props = {
  records: UsageRecord[];
  loading: boolean;
};

const PAGE_SIZE = 10;

export default function UsageHistoryTable({ records, loading }: Props) {
  const [itemFilter, setItemFilter] = useState("all");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const itemOptions = useMemo(() => {
    const names = new Set(records.map((r) => r.item_name));
    return Array.from(names).sort();
  }, [records]);

  const sortedRecords = useMemo(() => {
    return [...records].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [records]);

  const filteredRecords = useMemo(() => {
    return sortedRecords.filter((r) => {
      if (itemFilter !== "all" && r.item_name !== itemFilter) return false;
      if (date && r.created_at.slice(0, 10) !== date) return false;
      return true;
    });
  }, [sortedRecords, itemFilter, date]);

  useEffect(() => {
    setPage(1);
  }, [itemFilter, date, records]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasFilters = itemFilter !== "all" || date;

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
          <span>Tarikh</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        {hasFilters && (
          <button
            onClick={() => {
              setItemFilter("all");
              setDate("");
            }}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Mobile history cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="rounded-xl border p-4 bg-white shadow-sm">
              <div className="h-5 w-full animate-pulse rounded bg-gray-100" />
            </div>
          ))
        ) : paginatedRecords.length === 0 ? (
          <div className="rounded-xl border p-4 bg-white text-center text-sm text-gray-400">
            No usage records match this filter.
          </div>
        ) : (
          paginatedRecords.map((record) => {
            const recordDate = new Date(record.created_at);
            return (
              <div key={record.id} className="rounded-xl border p-4 bg-white shadow-sm">
                <div className="flex justify-between">
                  <p className="font-semibold">{record.item_name}</p>
                  <p className="text-sm text-gray-500">
                    {record.quantity} {record.usage_unit}
                  </p>
                </div>
                <p className="mt-2 text-xs text-gray-400">{recordDate.toLocaleString()}</p>
              </div>
            );
          })
        )}
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
            ) : paginatedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-sm text-gray-400">
                  No usage records match this filter.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map((record, index) => {
                const rowDate = new Date(record.created_at);
                const dateLabel = rowDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });
                const timeLabel = rowDate.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <TableRow key={record.id}>
                    <TableCell className="text-gray-400">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </TableCell>

                    <TableCell className="font-medium text-gray-900">
                      {record.item_name}
                    </TableCell>

                    <TableCell className="text-gray-700">
                      {record.quantity} {record.usage_unit}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-gray-500">
                      {dateLabel} <span className="text-gray-400">{timeLabel}</span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filteredRecords.length > 0 && (
        <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          hasNext={currentPage < totalPages}
          hasPrevious={currentPage > 1}
          onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
          onPrevious={() => setPage((p) => Math.max(p - 1, 1))}
          loading={loading}
          currentCount={paginatedRecords.length}
          totalCount={filteredRecords.length}
          pageSize={PAGE_SIZE}
          itemLabel="records"
        />
      )}
    </div>
  );
}