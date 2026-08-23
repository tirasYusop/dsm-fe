"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import type { Movement } from "@/types/movement";

type Props = {
  item: Movement | null;
  onClose: () => void;
};

export default function MovementDetailPanel({ item, onClose }: Props) {
  if (!item) return null;

  const isOut = item.movement_type === "out";

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Butiran Pergerakan Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <DetailRow label="Item" value={item.item_name} />
          <DetailRow
            label="Jenis"
            value={
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  isOut ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {item.movement_type}
              </span>
            }
          />
          <DetailRow label="Kuantiti" value={item.quantity} />

          {isOut ? (
            <>
              <DetailRow label="Kitchen" value={item.destination || "-"} />
              <DetailRow label="Remark" value={item.remarks || "-"} />
            </>
          ) : (
            <>
              <DetailRow label="Source" value={item.source || "-"} />
              <DetailRow label="Reason" value={item.reason || "-"} />
              <DetailRow label="Remark" value={item.remarks || "-"} />
            </>
          )}

          <DetailRow
            label="Tarikh"
            value={new Date(item.created_at).toLocaleString("en-MY", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          />

          {item.unit_price !== undefined && (
            <DetailRow label="Unit Harga" value={`RM ${item.unit_price}`} />
          )}
          {item.total_amount !== undefined && (
            <DetailRow label="Jumlah" value={`RM ${item.total_amount}`} />
          )}

          {item.proof_image && (
            <div>
              <p className="mb-1.5 font-medium text-gray-700">Bukti Gambar</p>
              <img
                src={item.proof_image}
                alt="Bukti pergerakan"
                className="max-h-72 w-full rounded border object-contain"
              />
            </div>
          )}
        </div>

        <Button
          onClick={onClose}
          className="mt-4 w-full py-2 text-white"
        >
          Tutup
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2 last:border-b-0">
      <span className="flex-shrink-0 font-medium text-gray-500">{label}</span>
      <span className="text-right text-gray-900">{value}</span>
    </div>
  );
}