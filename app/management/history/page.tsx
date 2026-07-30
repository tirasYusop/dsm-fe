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

function todayISO() {return new Date().toLocaleDateString("en-CA");}

export default function HistoryPage() {
  const [history, setHistory] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Movement | null>(null);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(todayISO());
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [kitchenFilter, setKitchenFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    setLoading(true);

    API.get("/stock-movements/?context=management")
      .then((res) => setHistory(res.data))
      .finally(() => setLoading(false));
  }, []);

  const kitchenOptions = useMemo(() => {
    return Array.from(
      new Set(
        history
          .map((h) => h.kitchen_name ?? h.destination)
          .filter(Boolean)
      )
    ).sort() as string[];
  }, [history]);

  const sourceOptions = useMemo(() => {
    return Array.from(
      new Set(
        history
          .map((h) => h.source)
          .filter(Boolean)
      )
    ).sort() as string[];
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      const matchesSearch = h.display_name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesType =
        typeFilter === "all" || h.movement_type === typeFilter;

      const location =
        h.movement_type === "out"
          ? h.destination
          : h.kitchen_name;

      const matchesLocation =
        locationFilter === "all" || location === locationFilter;
      const matchesKitchen =
        kitchenFilter === "all" ||
        h.kitchen_name === kitchenFilter;


      const matchesSource =
        sourceFilter === "all" ||
        h.source === sourceFilter;

      const matchesDate =
        !date ||
        new Date(h.created_at).toLocaleDateString("en-CA") === date;

      return (
         matchesSearch &&
        matchesType &&
        matchesLocation &&
        matchesDate &&
        matchesKitchen &&
        matchesSource
      );
    });
  }, [ history,
      search,
      typeFilter,
      locationFilter,
      date,
      kitchenFilter,
      sourceFilter]);

  const stockIn = filteredHistory.filter((h) => h.movement_type === "in");
  const stockOut = filteredHistory.filter((h) => h.movement_type === "out"
);

  const downloadPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Inventory History DSM@UMS", 14, 15);

    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleString("en-MY")}`,
      14,
      22
    );

    autoTable(doc, {
      startY: 30,
      head: [[
        "No",
        "Item",
        "Type",
        "Qty",
        "Location",
        "Source",
        "Remarks",
        "Total Price",
        "Date",
      ]],
      body: filteredHistory.map((m, index) => [
        index + 1,
        m.display_name,
        m.movement_type.toUpperCase(),
        m.quantity,
        m.movement_type === "out"
          ? (m.destination ?? "-")
          : (m.kitchen_name ?? "-"),
        m.source ?? "-",
        m.remarks ?? "-",
        m.total_amount != null
          ? `RM ${Number(m.total_amount).toFixed(2)}`
          : "-",
        new Date(m.created_at).toLocaleString("en-MY"),
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [55, 65, 81],
      },
      styles: {
        fontSize: 9,
      },
    });

    doc.save(
      `inventory-history-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inventory History</h1>

          <Button onClick={downloadPdf} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
        

        {/* FILTERS */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Search item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="all">All Locations</option>

              {kitchenOptions.map((kitchen) => (
                <option key={kitchen} value={kitchen}>
                  {kitchen}
                </option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="all">All Sources</option>

              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { value: "all", label: "All" },
              { value: "in", label: "Stock IN" },
              { value: "out", label: "Stock OUT" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTypeFilter(filter.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  typeFilter === filter.value
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* STOCK IN */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-green-600">
            Stock IN
          </h2>

          <MovementTable
            data={stockIn}
            loading={loading}
            onSelect={setSelected}
            selected={selected}
            showSource={true}
            showLocation={false}
            showPrice={true}
          />
        </div>

        {/* STOCK OUT */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-red-600">
            Stock OUT
          </h2>

          <MovementTable
            data={stockOut}
            loading={loading}
            onSelect={setSelected}
            selected={selected}
            showPrice={false}
            showSource={false}
            showLocation={true}

          />
        </div>

        <MovementDetailPanel
          item={selected}
          onClose={() => setSelected(null)}
        />
      </div>
    </RoleGuard>
  );
}