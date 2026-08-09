"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api1";
import MovementTable from "@/components/history/tableMovement";
import MovementDetailPanel from "@/components/history/details";
import RoleGuard from "@/components/auth/roleguard";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Movement } from "@/types/movement";
import PageHeader from "@/components/ui/page-header";
import PillTabs from "@/components/ui/pill-tabs";

const TABS = [
  { value: "stock in", label: "Stok Masuk" },
  { value: "stock out", label: "Stok Keluar" },
];

export default function HistoryPage() {
  const [history, setHistory] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Movement | null>(null);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [kitchenFilter, setKitchenFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("stock in");
  const [totalAmount, setTotalAmount] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, date, sourceFilter, activeTab]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params: Record<string, string | number> = {
      context: "management",
      page,
      movement_type: activeTab === "stock in" ? "in" : "out",
    };
    if (search.trim()) params.search = search.trim();
    if (date) params.date = date;
    if (sourceFilter !== "all") params.source = sourceFilter;

    API.get("/stock-movements/", { params })
      .then((res) => {
        setHistory(res.data.results ?? res.data);
        const count = res.data.count ?? res.data.length ?? 0;
        const size = res.data.page_size ?? 2;
        setTotalPages(Math.max(1, Math.ceil(count / size)));
      })
      .catch((err) => {
        console.log("Failed to load history:", err?.response?.status, err?.response?.data);
        setHistory([]);
        setError(err?.response?.data?.detail || "Failed to load movement history");
      })
      .finally(() => setLoading(false));
  }, [page, activeTab, search, date, sourceFilter]);

  // Fetch grand total across ALL matching rows (not just current page) — only meaningful for stock in
  useEffect(() => {
    if (activeTab !== "stock in") {
      setTotalAmount(null);
      return;
    }

    const params: Record<string, string | number> = {
      context: "management",
      movement_type: "in",
    };
    if (search.trim()) params.search = search.trim();
    if (date) params.date = date;
    if (sourceFilter !== "all") params.source = sourceFilter;

    API.get("/stock-movements/total-value/", { params })
      .then((res) => setTotalAmount(Number(res.data.total_amount) || 0))
      .catch((err) => {
        console.log("Failed to load total value:", err?.response?.status, err?.response?.data);
        setTotalAmount(null);
      });
  }, [activeTab, search, date, sourceFilter]);

  const kitchenOptions = useMemo(() => {
    return Array.from(
      new Set(history.map((h) => h.kitchen_name ?? h.destination).filter(Boolean))
    ).sort() as string[];
  }, [history]);

  const sourceOptions = useMemo(() => {
    return Array.from(new Set(history.map((h) => h.source).filter(Boolean))).sort() as string[];
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      const location = h.movement_type === "out" ? h.destination : h.kitchen_name;
      const matchesLocation = locationFilter === "all" || location === locationFilter;
      const matchesKitchen = kitchenFilter === "all" || h.kitchen_name === kitchenFilter;
      return matchesLocation && matchesKitchen;
    });
  }, [history, locationFilter, kitchenFilter]);

  const hasActiveFilters =
    !!search.trim() || !!date || locationFilter !== "all" || kitchenFilter !== "all" || sourceFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setDate("");
    setLocationFilter("all");
    setKitchenFilter("all");
    setSourceFilter("all");
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Ringkasan Inventori DSM@UMS", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString("en-MY")}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [["No", "Item", "Type", "Qty", "Location", "Source", "Remarks", "Total Price", "Date"]],
      body: filteredHistory.map((m, index) => [
        index + 1,
        m.display_name,
        m.movement_type.toUpperCase(),
        m.quantity,
        m.movement_type === "out" ? (m.destination ?? "-") : (m.kitchen_name ?? "-"),
        m.source ?? "-",
        m.remarks ?? "-",
        m.total_amount != null ? `RM ${Number(m.total_amount).toFixed(2)}` : "-",
        new Date(m.created_at).toLocaleString("en-MY"),
      ]),
      theme: "grid",
      headStyles: { fillColor: [55, 65, 81] },
      styles: { fontSize: 9 },
    });

    if (activeTab === "stock in" && totalAmount != null) {
      const finalY = (doc as any).lastAutoTable?.finalY ?? 30;
      doc.setFontSize(11);
      doc.text(`Jumlah Keseluruhan: RM ${totalAmount.toFixed(2)}`, 14, finalY + 10);
    }

    doc.save(`inventory-history-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <PageHeader
          title="Sejarah Pergerakkan Inventori (Masuk / Keluar)"
          action={
            <Button onClick={downloadPdf} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Eksport PDF
            </Button>
          }
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Search item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />

            <div className="flex items-center gap-1">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
              {date && (
                <button onClick={() => setDate("")} className="text-xs text-gray-400 hover:text-gray-600" type="button">
                  Clear
                </button>
              )}
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="all">All Locations</option>
              {kitchenOptions.map((kitchen) => <option key={kitchen} value={kitchen}>{kitchen}</option>)}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="all">All Sources</option>
              {sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}
            </select>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs font-medium text-gray-500 underline hover:text-gray-700" type="button">
                Clear all filters
              </button>
            )}
          </div>

          {activeTab === "stock in" && totalAmount != null && (
            <div className="text-sm font-semibold text-gray-700">
              Jumlah Keseluruhan: RM {totalAmount.toFixed(2)}
            </div>
          )}
        </div>

        <PillTabs options={TABS} value={activeTab} onChange={setActiveTab} />

        <MovementTable
          data={filteredHistory}
          loading={loading}
          onSelect={setSelected}
          selected={selected}
          showSource={activeTab === "stock in"}
          showLocation={activeTab === "stock out"}
          showPrice={activeTab === "stock in"}
        />

        <div className="flex items-center justify-center gap-4 border-t pt-4">
          <Button variant="outline" disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <Button variant="outline" disabled={page === totalPages || loading} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>

        <MovementDetailPanel item={selected} onClose={() => setSelected(null)} />
      </div>
    </RoleGuard>
  );
}