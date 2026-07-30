"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import API from "@/lib/api1";

export default function KitchenQRPage() {
  const params = useParams();
  const id = params.id;
  const [qr, setQr] = useState<any>(null);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await API.get(`/kitchens/${id}/qr/`);
        setQr(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (id) {
      fetchQR();
    }
  }, [id]);

  if (!qr) {
    return <div className="p-6">Loading QR...</div>;
  }

  return (
    <div className="p-6 flex flex-col items-center gap-8">
      <h1 className="text-2xl font-bold">{qr.kitchen_name}</h1>

      <div className="border p-5 rounded item-center">
        <h2 className="font-bold text-center mb-3">{qr.kitchen_code} Kitchen QR</h2>
        <QRCodeCanvas className="item-center w-full" value={qr.qr_url} size={300} />
        <p className="text-sm text-muted-foreground text-center mt-3">
          Scan to check in or record kitchen activity
        </p>
      </div>
    </div>
  );
}