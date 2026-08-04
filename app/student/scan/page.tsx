"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"scanning" | "invalid">("scanning");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    const success = async (decodedText: string) => {
      try {
        const url = new URL(decodedText);
        const kitchen = url.searchParams.get("kitchen");

        if (!kitchen) {
          setStatus("invalid");
          return;
        }

        await scanner.clear();
        router.push(`/student/checkin?kitchen=${kitchen}`);
      } catch (error) {
        console.error(error);
        setStatus("invalid");
      }
    };

    scanner.render(success, () => {});
    return () => {
      scanner.clear().catch(() => {});
    };
  }, [router]);

  return (
    <div className="mx-auto space-y-6 p-3 ">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900 sm:text-xl">
          <QrCode className="h-5 w-5 text-gray-400" />
          Imbas QR dapur
        </h1>
        <p className="text-sm text-gray-500">
          Halakan kamera anda ke arah kod QR yang dipaparkan di pintu masuk dapur.
        </p>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-4">
          <div id="qr-reader" className="overflow-hidden rounded-lg" />
        </CardContent>
      </Card>

      {status === "invalid" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Kod QR itu tidak dapat dikesan. Pastikan anda mengimbas kod tersebut di pintu masuk dapur, kemudian cuba lagi.
        </div>
      )}
    </div>
  );
}