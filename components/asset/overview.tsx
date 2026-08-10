"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, ChevronRight } from "lucide-react";
import type { OverviewAsset, AssetOption } from "@/types/asset";
import AssetDetailPanel from "./assetpanel";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  maintenance: "bg-amber-100 text-amber-700",
  disposed: "bg-red-100 text-red-700",
};

export default function AssetOverviewTab() {
  const [overview, setOverview] = useState<OverviewAsset[]>([]);
  const [assetOptions, setAssetOptions] = useState<AssetOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [selectedAsset, setSelectedAsset] = useState("");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await API.get("/assets/overview/");
      setOverview(res.data);
      setAssetOptions(res.data.map((a: OverviewAsset) => ({ id: a.id, name_brand: a.name_brand })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const selectedAssetDetail = overview.find((a) => a.id === selectedId) ?? null;

  const generatePdf = async () => {
    if (!selectedYear) {
      alert("Sila pilih tahun");
      return;
    }

    try {
      const params: any = { year: selectedYear };
      if (selectedAsset) params.asset = selectedAsset;

      const res = await API.get("/assets/annual-report/", { params });
      const rows: any[] = res.data;

      if (rows.length === 0) {
        alert("Tiada data untuk tahun/aset yang dipilih");
        return;
      }

      const doc = new jsPDF();
      let y = 14;

      doc.setFontSize(16);
      doc.text(`Asset Annual Report - ${selectedYear}`, 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Dijana: ${new Date().toLocaleString("en-MY")}`, 14, y);
      y += 8;

      rows.forEach((asset) => {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`${asset.name_brand} (${asset.location ?? "-"}) - ${asset.status_display}`, 14, y);
        y += 4;

        const body = asset.events.map((e: any) => [
          e.type === "purchase" ? "Purchase" : e.type === "maintenance" ? "Maintenance" : "Pelupusan",
          new Date(e.date).toLocaleDateString("en-MY"),
          e.notes || "-",
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Type", "Date", "Notes"]],
          body,
          theme: "grid",
          styles: { fontSize: 9 },
          headStyles: { fillColor: [40, 40, 40] },
        });

        y = (doc as any).lastAutoTable.finalY + 10;
      });

      doc.save(`laporan-aset-${selectedYear}.pdf`);
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Gagal menjana laporan");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 border rounded-lg p-4 bg-gray-50 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="text-sm font-medium block mb-1">Pilih Asset</label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Semua Asset</option>
            {assetOptions.map((a) => (
              <option key={a.id} value={a.id}>#{a.id} - {a.name_brand}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[100px] sm:flex-none">
          <label className="text-sm font-medium block mb-1">Select Year</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full border rounded px-3 py-2 sm:w-28"
            placeholder="2026"
          />
        </div>

        <Button onClick={generatePdf} className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-1.5" />
          Cetak PDF
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Senarai Status Aset Semasa
        </h2>

        {/* Mobile: stacked cards */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
              Sedang memuatkan data aset...
            </div>
          ) : overview.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
              Tiada aset yang telah didaftarkan lagi.
            </div>
          ) : (
            overview.map((asset) => {
              const maintenanceEntries = asset.transactions.filter((t) => t.type === "maintenance");
              const disposalEntries = asset.transactions.filter((t) => t.type === "disposal");
              const remarks = asset.transactions.filter((t) => t.notes);

              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setSelectedId(asset.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left active:bg-gray-50"
                >
                  {asset.image ? (
                    <img
                      src={asset.image}
                      alt={asset.name_brand}
                      className="h-14 w-14 shrink-0 rounded-lg border object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-lg border bg-gray-50" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        #{asset.id} - {asset.name_brand}
                      </p>
                      <Badge className={`shrink-0 ${STATUS_STYLES[asset.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {asset.status_display}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {asset.original_location ?? "-"} · {asset.quantity} unit ({asset.available_quantity} tersedia)
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {new Date(asset.purchase_date).toLocaleDateString("en-MY")}
                      {maintenanceEntries.length > 0 && ` · ${maintenanceEntries.length} penyelenggaraan`}
                      {disposalEntries.length > 0 && ` · ${disposalEntries.length} pelupusan`}
                    </p>
                    {remarks.length > 0 && (
                      <p className="mt-1 truncate text-xs text-gray-400">
                        {remarks[remarks.length - 1].notes}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                </button>
              );
            })
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Gambar</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Nama Aset</TableHead>
                <TableHead>Tarikh Pembelian</TableHead>
                <TableHead>Kolej</TableHead>
                <TableHead>Kuantiti</TableHead>
                <TableHead>Statu Semasa</TableHead>
                <TableHead>Penyelenggaraan</TableHead>
                <TableHead>Pelupusan</TableHead>
                <TableHead>Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-gray-500">
                    Sedang memuatkan data aset...
                  </TableCell>
                </TableRow>
              ) : overview.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-gray-500">
                    Tiada aset yang telah didaftarkan lagi.
                  </TableCell>
                </TableRow>
              ) : (
                overview.map((asset) => {
                  const maintenanceEntries = asset.transactions.filter((t) => t.type === "maintenance");
                  const disposalEntries = asset.transactions.filter((t) => t.type === "disposal");
                  const remarks = asset.transactions.filter((t) => t.notes);

                  return (
                    <TableRow
                      key={asset.id}
                      onClick={() => setSelectedId(asset.id)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>
                        {asset.image ? (
                          <img
                            src={asset.image}
                            alt={asset.name_brand}
                            className="h-10 w-10 rounded border object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded border bg-gray-50" />
                        )}
                      </TableCell>
                      <TableCell>#{asset.id}</TableCell>
                      <TableCell className="font-medium">{asset.name_brand}</TableCell>
                      <TableCell>{new Date(asset.purchase_date).toLocaleDateString("en-MY")}</TableCell>
                      <TableCell>{asset.original_location ?? "-"}</TableCell>
                      <TableCell>
                        {asset.quantity} ({asset.available_quantity} tersedia)
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[asset.status] ?? "bg-gray-100 text-gray-700"}>
                          {asset.status_display}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {maintenanceEntries.length > 0 ? `${maintenanceEntries.length} rekod` : "-"}
                      </TableCell>
                      <TableCell>
                        {disposalEntries.length > 0 ? `${disposalEntries.length} rekod` : "-"}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate">
                        {remarks.length > 0 ? remarks[remarks.length - 1].notes : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AssetDetailPanel
        asset={selectedAssetDetail}
        onClose={() => setSelectedId(null)}
        onUpdated={fetchOverview}
      />
    </div>
  );
}