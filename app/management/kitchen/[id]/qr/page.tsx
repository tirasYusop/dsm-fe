"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import API from "@/lib/api1";
import PageHeader from "@/components/ui/page-header";

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
    if (id) fetchQR();
  }, [id]);

  if (!qr) {
    return <div className="p-4 text-sm text-gray-500">Loading QR...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={qr.kitchen_name} subtitle={`Kod: ${qr.kitchen_code}`} />

      <div className="flex flex-col items-center gap-4 rounded-lg border bg-white p-6">
        <QRCodeCanvas value={qr.qr_url} size={300} />
        <p className="text-sm text-gray-500 text-center">
          Imbas untuk daftar masuk atau merekod aktiviti dapur
        </p>
      </div>
    </div>
  );
}