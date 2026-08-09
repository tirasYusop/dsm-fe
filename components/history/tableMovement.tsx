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

  return (
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
          <TableCell className="p-2">
            {new Date(m.created_at).toLocaleString("en-MY", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit", hour12: true,
            })}
          </TableCell>
        </TableRow>
      )}
    />
  );
}