"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import RoleGuard from "@/components/auth/roleguard";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

type OverviewAsset = {
  id: number;
  name_brand: string;
  purchase_date: string;
  original_location: string | null;
  status: string;
  status_display: string;
  transactions: { type: string; date: string; notes: string }[];
};

type AssetOption = {
  id: number;
  name_brand: string;
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  disposed: "bg-red-100 text-red-700",
};

export default function AssetReportPage() {
  const [overview, setOverview] = useState<OverviewAsset[]>([]);
  const [assetOptions, setAssetOptions] = useState<AssetOption[]>([]);
  const [loading, setLoading] = useState(false);

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

  const generatePdf = async () => {
    if (!selectedYear) {
      alert("Please choose a year");
      return;
    }

    try {
      const params: any = { year: selectedYear };
      if (selectedAsset) params.asset = selectedAsset;

      const res = await API.get("/assets/annual-report/", { params });
      const rows: any[] = res.data;

      if (rows.length === 0) {
        alert("No data for the selected year/asset");
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
      alert(err?.response?.data?.error ?? "Failed to generate report");
    }
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Generate Asset Annual Report</h1>

        <div className="flex flex-wrap items-end gap-4 border rounded-lg p-4 bg-gray-50">
          <div>
            <label className="text-sm font-medium block mb-1">Select Asset</label>
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
            Print PDF
          </Button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">
            List of Current Asset Status
          </h2>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Transaction History</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      Loading asset data...
                    </TableCell>
                  </TableRow>
                ) : overview.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No assets have been registered yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  overview.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>#{asset.id}</TableCell>
                      <TableCell className="font-medium">{asset.name_brand}</TableCell>
                      <TableCell>{new Date(asset.purchase_date).toLocaleDateString("en-MY")}</TableCell>
                      <TableCell>{asset.original_location ?? "-"}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[asset.status] ?? "bg-gray-100 text-gray-700"}>
                          {asset.status_display}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {asset.transactions.length === 0 ? (
                          <span className="text-gray-400 text-sm">-</span>
                        ) : (
                          <ul className="text-xs space-y-0.5">
                            {asset.transactions.map((t, i) => (
                              <li key={i}>
                                {t.type === "maintenance" ? "🔧" : "🗑️"}{" "}
                                {new Date(t.date).toLocaleDateString("en-MY")}
                                {t.notes && ` — ${t.notes}`}
                              </li>
                            ))}
                          </ul>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}