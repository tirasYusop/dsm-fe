"use client";

import { QRCodeCanvas } from "qrcode.react";

export default function TestQRPage() {
  const studentId = "123";

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const inventoryQR = `${baseUrl}/student/scan/activity?studentId=${studentId}&type=inventory`;

  return (
    <div className="p-6 flex flex-col items-center gap-6">

      <h1 className="text-2xl font-bold">
        Student Inventory QR
      </h1>

      <div className="border p-4 rounded-lg text-center">
        <QRCodeCanvas value={inventoryQR} size={220} />
        <p className="mt-2 text-sm text-gray-600">
          Scan to open inventory checklist
        </p>
      </div>

    </div>
  );
}