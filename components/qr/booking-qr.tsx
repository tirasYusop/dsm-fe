"use client";

import { QRCodeCanvas } from "qrcode.react";

type Props = {
  bookingId: string;
};

export default function BookingQRs({ bookingId }: Props) {
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  const attendanceQR = `${baseUrl}/scan?type=attendance&bookingId=${bookingId}`;
  const inventoryQR = `${baseUrl}/scan?type=inventory&bookingId=${bookingId}`;

  return (
    <div className="flex flex-col items-center gap-6">

      <h2 className="text-lg font-bold">Your QR Codes</h2>

      {/* QR Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Attendance QR */}
        <div className="flex flex-col items-center border p-4 rounded-lg">
          <QRCodeCanvas value={attendanceQR} size={180} />
          <p className="mt-2 font-medium">Attendance QR</p>
          <p className="text-xs text-muted-foreground text-center">
            Scan to mark attendance
          </p>
        </div>

        {/* Inventory QR */}
        <div className="flex flex-col items-center border p-4 rounded-lg">
          <QRCodeCanvas value={inventoryQR} size={180} />
          <p className="mt-2 font-medium">Inventory QR</p>
          <p className="text-xs text-muted-foreground text-center">
            Scan to record food taken
          </p>
        </div>

      </div>
    </div>
  );
}