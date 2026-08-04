"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";
import type {OverviewAsset,AssetOption} from "@/types/asset"
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
      <div className="flex flex-wrap items-end gap-4 border rounded-lg p-4 bg-gray-50">
        <div>
          <label className="text-sm font-medium block mb-1">Pilih Asset</label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="border rounded px-3 py-2 min-w-[200px]"
          >
            <option value="">Semua Asset</option>
            {assetOptions.map((a) => (
              <option key={a.id} value={a.id}>#{a.id} - {a.name_brand}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Select Year</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border rounded px-3 py-2 w-28"
            placeholder="2026"
          />
        </div>

        <Button onClick={generatePdf}>
          <Download className="h-4 w-4 mr-1.5" />
          Cetak PDF
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Senarai Status Aset Semasa
        </h2>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
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
                            className="h-12 w-12 rounded-lg border object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg border bg-gray-50" />
                        )}
                      </TableCell>
                      <TableCell>#{asset.id}</TableCell>
                      <TableCell className="font-medium">{asset.name_brand}</TableCell>
                      <TableCell>{new Date(asset.purchase_date).toLocaleDateString("en-MY")}</TableCell>
                      <TableCell>{asset.original_location ?? "-"}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">{asset.quantity} jumlah</div>
                        <div className="text-xs text-gray-400">
                          {asset.available_quantity} tersedia
                          {asset.in_maintenance_quantity > 0 && ` · ${asset.in_maintenance_quantity} penyelenggaraan`}
                          {asset.disposed_quantity > 0 && ` · ${asset.disposed_quantity} dilupuskan`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[asset.status] ?? "bg-gray-100 text-gray-700"}>
                          {asset.status_display}
                        </Badge>
                      </TableCell>

                      {/* Penyelenggaraan */}
                      <TableCell>
                        {maintenanceEntries.length === 0 ? (
                          <span className="text-gray-400 text-sm">-</span>
                        ) : (
                          <ul className="space-y-1.5 text-xs">
                            {maintenanceEntries.map((t, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span>
                                  🔧 {t.quantity} unit — {new Date(t.date).toLocaleDateString("en-MY")} –{" "}
                                  {t.end_date ? new Date(t.end_date).toLocaleDateString("en-MY") : "sedang berjalan"}
                                </span>
                                <div className="flex gap-1">
                                  {t.photo_before && (
                                    <a href={t.photo_before} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                      <img src={t.photo_before} alt="Sebelum" className="h-8 w-8 rounded border object-cover" />
                                    </a>
                                  )}
                                  {t.photo_after && (
                                    <a href={t.photo_after} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                      <img src={t.photo_after} alt="Selepas" className="h-8 w-8 rounded border object-cover" />
                                    </a>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </TableCell>

                      {/* Pelupusan */}
                      <TableCell>
                        {disposalEntries.length === 0 ? (
                          <span className="text-gray-400 text-sm">-</span>
                        ) : (
                          <ul className="space-y-1.5 text-xs">
                            {disposalEntries.map((t, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span>
                                  🗑️ {t.quantity} unit — {new Date(t.date).toLocaleDateString("en-MY")}
                                </span>
                                {t.photo && (
                                  <a href={t.photo} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                    <img src={t.photo} alt="Bukti" className="h-8 w-8 rounded border object-cover" />
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </TableCell>

                      {/* Remark */}
                      <TableCell>
                        {remarks.length === 0 ? (
                          <span className="text-gray-400 text-sm">-</span>
                        ) : (
                          <ul className="space-y-1 text-xs text-gray-600">
                            {remarks.map((t, i) => (
                              <li key={i}>
                                {t.type === "maintenance" ? "🔧" : "🗑️"} {t.notes}
                              </li>
                            ))}
                          </ul>
                        )}
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