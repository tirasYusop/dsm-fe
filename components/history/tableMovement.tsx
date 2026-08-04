"use client";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import type { Movement } from "@/types/movement";

type Props = {
  data: Movement[];
  loading: boolean;
  onSelect: (item: Movement) => void;
  selected: Movement | null;
  showSource?: boolean;
  showLocation?: boolean;
  showPrice?:boolean;
};

export default function MovementTable({
  data,
  loading,
  onSelect,
  selected,
  showSource = true,
  showLocation =true,
  showPrice=true ,
}: Props) {
  
  return (
    <div className="border rounded bg-white">

      {loading ? (
        <div className="p-4">
          Loading...
        </div>
      ) : (

        <Table className="w-full">

          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="p-2 text-left w-10">No.</TableHead>
              <TableHead className="p-2 text-left">Item</TableHead>
              <TableHead className="p-2 text-left">Jenis</TableHead>
              <TableHead className="p-2 text-left">Qty</TableHead>
              {showPrice && (
                <TableHead className="p-2 text-left">Jumlah Harga</TableHead>
              )}
              <TableHead className="p-2 text-left">Catatan</TableHead>
              {showSource && (
                <TableHead className="p-2 text-left">Sumber</TableHead>
              )}
              {showLocation && (
                <TableHead className="p-2 text-left">Tempat</TableHead>
              )}
              <TableHead className="p-2 text-left">Tarikh Dan Masa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((m, index) => (
              <TableRow
                key={m.id}
                onClick={() => onSelect(m)}
                className={`cursor-pointer border-t hover:bg-gray-50 ${
                  selected?.id === m.id
                    ? "bg-green-100"
                    : ""
                }`}
              >
                <TableCell className="p-2">{index +1}</TableCell>
                <TableCell className="p-2">{m.display_name}</TableCell>
                <TableCell className="p-2">{m.movement_type}</TableCell>
                <TableCell className="p-2">{m.quantity}</TableCell>
                {showPrice && (
                  <TableCell className="p-2">{m.total_amount}</TableCell>
                )}
                <TableCell className="p-2">{m.remarks || "-"}</TableCell>
                {showSource && (
                  <TableCell className="p-2">{m.source || "-"}</TableCell>
                )}
                {showLocation && (
                <TableCell>
                {
                  m.movement_type==="out"
                  ? m.destination || "-"
                  : m.kitchen_name || "-"
                }
                </TableCell>
                )}
                <TableCell className="p-2">
                  {new Date(m.created_at).toLocaleString("en-MY", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}