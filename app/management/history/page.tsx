"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api1";
import MovementTable from "@/components/history/tableMovement";
import MovementDetailPanel from "@/components/history/details";
import RoleGuard from "@/components/auth/roleguard";
import type { Movement } from "@/types/movement";
import PageHeader from "@/components/ui/page-header";
import PillTabs from "@/components/ui/pill-tabs";
import FilterBar from "@/components/filterBar";
import ExportButton from "@/components/exportButton";
import PaginationControls from "@/components/common/PaginationControls";
import { getResults, getPageMeta, type PaginatedResponse } from "@/lib/pagination";

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
  const [pageSize, setPageSize] = useState(2);
  const [count, setCount] = useState(0);
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
        const data: PaginatedResponse<Movement> | Movement[] = res.data;
        const results = getResults(data);
        setHistory(results);

        const meta = getPageMeta(data, results.length || 2);
        setPageSize(meta.page_size);
        setCount(meta.count);
        setTotalPages(Math.max(1, Math.ceil(meta.count / meta.page_size)));
      })
      .catch((err) => {
        console.log("Failed to load history:", err?.response?.status, err?.response?.data);
        setHistory([]);
        setError(err?.response?.data?.detail || "Failed to load movement history");
      })
      .finally(() => setLoading(false));
  }, [page, activeTab, search, date, sourceFilter]);

  useEffect(() => {
    if (activeTab !== "stock in") {
      setTotalAmount(null);
      return;
    }

    const params: Record<string, string | number> = { context: "management", movement_type: "in" };
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
    return Array.from(new Set(history.map((h) => h.kitchen_name ?? h.destination).filter(Boolean))).sort() as string[];
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

  const exportRows = filteredHistory.map((m, index) => [
    index + 1,
    m.display_name,
    m.movement_type.toUpperCase(),
    m.quantity,
    m.movement_type === "out" ? (m.destination ?? "-") : (m.kitchen_name ?? "-"),
    m.source ?? "-",
    m.remarks ?? "-",
    m.total_amount != null ? `RM ${Number(m.total_amount).toFixed(2)}` : "-",
    new Date(m.created_at).toLocaleString("en-MY"),
  ]);

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <PageHeader
          title="Sejarah Pergerakkan Inventori (Masuk / Keluar)"
          action={
            <ExportButton
              title="Ringkasan Inventori DSM@UMS"
              filename="inventory-history"
              columns={["No", "Item", "Type", "Qty", "Location", "Source", "Remarks", "Total Price", "Date"]}
              rows={exportRows}
              footer={
                activeTab === "stock in" && totalAmount != null
                  ? ["", "", "", "", "", "", "", "Jumlah", `RM ${totalAmount.toFixed(2)}`]
                  : undefined
              }
            />
          }
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <FilterBar
          search={{ value: search, onChange: setSearch, placeholder: "Search item..." }}
          selects={[
            {
              value: locationFilter === "all" ? "" : locationFilter,
              onChange: (v) => setLocationFilter(v || "all"),
              options: kitchenOptions.map((k) => ({ value: k, label: k })),
              allLabel: "All Locations",
            },
            {
              value: sourceFilter === "all" ? "" : sourceFilter,
              onChange: (v) => setSourceFilter(v || "all"),
              options: sourceOptions.map((s) => ({ value: s, label: s })),
              allLabel: "All Sources",
            },
          ]}
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
          rightSlot={
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
              {activeTab === "stock in" && totalAmount != null && (
                <span className="ml-3 text-sm font-semibold text-gray-700">
                  Jumlah Keseluruhan: RM {totalAmount.toFixed(2)}
                </span>
              )}
            </div>
          }
        />

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

        <PaginationControls
          page={page}
          totalPages={totalPages}
          hasPrevious={page > 1}
          hasNext={page < totalPages}
          onPrevious={() => setPage(page - 1)}
          onNext={() => setPage(page + 1)}
          loading={loading}
          totalCount={count}
          pageSize={pageSize}
          itemLabel="rekod"
        />

        <MovementDetailPanel item={selected} onClose={() => setSelected(null)} />
      </div>
    </RoleGuard>
  );
}