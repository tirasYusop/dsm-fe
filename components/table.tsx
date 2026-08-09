"use client";

import { ReactNode } from "react";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

type Column = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  className?: string;
};

type Props<T> = {
  columns: Column[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  renderRow: (item: T, index: number) => ReactNode;
  onRowClick?: (item: T) => void;
};

export default function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = "Tiada data.",
  renderRow,
}: Props<T>) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gray-100">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={`p-2 font-bold text-${col.align ?? "left"} ${col.className ?? ""}`}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-4 text-sm text-gray-500">
                Loading...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-6 text-center text-sm text-gray-500">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </TableBody>
      </Table>
    </div>
  );
}