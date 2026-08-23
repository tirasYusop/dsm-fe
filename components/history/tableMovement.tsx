// components/history/tableMovement.tsx
"use client";

import DataTable from "@/components/table";
import { TableRow, TableCell } from "@/components/ui/table";
import type { Movement } from "@/types/movement";

type Props = {
  data: Movement[];
  loading: boolean;
  onSelect: (item: Movement) => void;
  selected: Movement | null;
  showSource?: boolean;
  showLocation?: boolean;
  showPrice?: boolean;
};

export default function MovementTable({
  data,
  loading,
  onSelect,
  selected,
  showSource = true,
  showLocation = true,
  showPrice = true,
}: Props) {
  const columns = [
    { key: "no", label: "No.", className: "w-10" },
    { key: "item", label: "Item" },
    { key: "type", label: "Jenis" },
    { key: "qty", label: "Qty" },
    ...(showPrice ? [{ key: "price", label: "Jumlah Harga" }] : []),
    { key: "notes", label: "Catatan" },
    ...(showSource ? [{ key: "source", label: "Sumber" }] : []),
    ...(showLocation ? [{ key: "location", label: "Tempat" }] : []),
    { key: "date", label: "Tarikh Dan Masa" },
  ];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <>
      {/* Desktop / tablet: table */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="Tiada pergerakan direkodkan."
          renderRow={(m, index) => (
            <TableRow
              key={m.id}
              onClick={() => onSelect(m)}
              className={`cursor-pointer border-t hover:bg-gray-50 ${
                selected?.id === m.id ? "bg-green-100" : ""
              }`}
            >
              <TableCell className="p-2">{index + 1}</TableCell>
              <TableCell className="p-2">{m.display_name}</TableCell>
              <TableCell className="p-2">{m.movement_type}</TableCell>
              <TableCell className="p-2">{m.quantity}</TableCell>
              {showPrice && <TableCell className="p-2">{m.total_amount}</TableCell>}
              <TableCell className="p-2">{m.remarks || "-"}</TableCell>
              {showSource && <TableCell className="p-2">{m.source || "-"}</TableCell>}
              {showLocation && (
                <TableCell className="p-2">
                  {m.movement_type === "out" ? m.destination || "-" : m.kitchen_name || "-"}
                </TableCell>
              )}
              <TableCell className="p-2">{formatDate(m.created_at)}</TableCell>
            </TableRow>
          )}
        />
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 sm:hidden">
        {loading ? (
          <div className="rounded-lg border bg-white p-4 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
            Tiada pergerakan direkodkan.
          </div>
        ) : (
          data.map((m, index) => {
            const isOut = m.movement_type === "out";
            const location = isOut ? m.destination || "-" : m.kitchen_name || "-";

            return (
              <button
                type="button"
                key={m.id}
                onClick={() => onSelect(m)}
                className={`w-full rounded-lg border p-4 text-left shadow-sm transition ${
                  selected?.id === m.id ? "border-green-300 bg-green-50" : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">#{index + 1}</p>
                    <p className="truncate font-semibold text-gray-900">{m.display_name}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      isOut ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {m.movement_type}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-y-2 border-t border-gray-100 pt-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Qty</p>
                    <p className="font-medium text-gray-800">{m.quantity}</p>
                  </div>
                  {showPrice && (
                    <div>
                      <p className="text-xs text-gray-400">Jumlah Harga</p>
                      <p className="font-medium text-gray-800">{m.total_amount ?? "-"}</p>
                    </div>
                  )}
                  {showSource && (
                    <div>
                      <p className="text-xs text-gray-400">Sumber</p>
                      <p className="font-medium text-gray-800">{m.source || "-"}</p>
                    </div>
                  )}
                  {showLocation && (
                    <div>
                      <p className="text-xs text-gray-400">Tempat</p>
                      <p className="font-medium text-gray-800">{location}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Tarikh Dan Masa</p>
                    <p className="font-medium text-gray-800">{formatDate(m.created_at)}</p>
                  </div>
                </div>

                {m.remarks && (
                  <div className="mt-2 border-t border-gray-100 pt-2 text-sm text-gray-600">
                    <p className="text-xs text-gray-400">Catatan</p>
                    <p className="truncate">{m.remarks}</p>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </>
  );
}