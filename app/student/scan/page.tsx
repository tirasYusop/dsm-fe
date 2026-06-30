"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScanPage() {
  const router = useRouter();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

    const onScanSuccess = async (decodedText: string) => {
      console.log("QR SCANNED:", decodedText);

      try {
        const url = new URL(decodedText);

        const type = url.searchParams.get("type");
        const bookingId = url.searchParams.get("bookingId");

        if (!type || !bookingId) {
          alert("Invalid QR Code ❌");
          return;
        }

        scanner.clear();

        if (type === "attendance") {
          const res = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId }),
          });

          if (res.ok) {
            alert("Attendance marked ✔");
          } else {
            alert("Failed to mark attendance ❌");
          }

          return;
        }

        if (type === "inventory") {
          router.push(`/activity/${bookingId}`);
          return;
        }

        alert("Unknown QR type ❌");
      } catch (err) {
        console.error(err);
        alert("Invalid QR format ❌");
      }
    };

    scanner.render(onScanSuccess, (error) => {
    });

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [router]);

  return (
    <div className="p-6 flex flex-col items-center space-y-4">
      <h1 className="text-xl font-bold">Scan QR Code</h1>
      <p className="text-sm text-muted-foreground">
        Attendance & Inventory Scanner
      </p>

      <div id="qr-reader" className="w-full max-w-sm" />
    </div>
  );
}