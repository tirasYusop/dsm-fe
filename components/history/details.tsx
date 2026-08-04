"use client";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import type { Movement } from "@/types/movement";

type Props = {
  item: Movement | null;
  onClose: () => void;
};

export default function MovementDetailPanel({
  item,
  onClose,
}: Props) {

  if (!item) return null;


  return (
    <Card>
      <div className="p-4">
        <CardHeader className="text-xl font-bold mb-4">
         Butiran Pergerakan Item
        </CardHeader>
        <CardContent className="space-y-2 pl-20">
          <p>
            <b>Item:</b> {item.item_name}
          </p>
          <p>
            <b>Jenis:</b> {item.movement_type}
          </p>
          <p>
            <b>Kuantiti:</b> {item.quantity}
          </p>
          {item.movement_type === "out" ? (
            <>
              <p><b>Kitchen:</b> {item.destination || "-"}</p>
              <p><b>Remark:</b> {item.remarks || "-"}</p>
            </>
          ) : (
            <>
              <p><b>Source:</b> {item.source || "-"}</p>
              <p><b>Reason:</b> {item.reason || "-"}</p>
              <p><b>Remark:</b> {item.remarks || "-"}</p>
            </>
          )}
          <p><b>Tarikh:</b>{" "}
            {new Date(item.created_at).toLocaleString("en-MY", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
          {item.unit_price !== undefined && (
            <p><b>Unit Harga:</b> RM {item.unit_price} </p>
          )}
          {item.total_amount !== undefined && (
            <p><b>Jumlah:</b> RM {item.total_amount}</p>
          )}
          {item.proof_image && (
            <img src={item.proof_image}className="w-100 h-100 mt-3 rounded border"/>
          )}
        </CardContent>
        <Button
          onClick={onClose}
          className="mt-4 w-full destructive text-white py-2 rounded"
        >
          Tutup
        </Button>
      </div>
    </Card>
  );
}