"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import SourceFilter from "@/components/inventory/sourceFilter";
import StatusBadge from "@/components/inventory/StatusBadge";
import StockMovementModal, { Kitchen } from "@/components/inventory/stockmovementmodel";
import AddSourceItemDrawer from "@/components/inventory/addsourceitemdrawer";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import type { SourceStock, ItemWithStock, MovementTarget } from "@/types/inventory";
import PageHeader from "@/components/ui/page-header";
import PillTabs from "@/components/ui/pill-tabs";
import PaginationControls from "@/components/common/PaginationControls";
import { getResults, getPageMeta, type PaginatedResponse } from "@/lib/pagination";

const SOURCES = [
  { value: "donation", label: "Donation" },
  { value: "purchase", label: "Purchase" },
  { value: "sponsor", label: "Sponsor" },
  { value: "supplier", label: "Supplier" },
  { value: "other", label: "Other" },
];

export default function InventoryPage() {
  const [tab, setTab] = useState<"in" | "out">("in");
  const [source, setSource] = useState("donation");
  const [sourceStocks, setSourceStocks] = useState<SourceStock[]>([]);
  const [outItems, setOutItems] = useState<ItemWithStock[]>([]);
  const [loading, setLoading] = useState(false);

  // pagination state — "Stok Masuk" (in)
  const [inPage, setInPage] = useState(1);
  const [inTotalPages, setInTotalPages] = useState(1);
  const [inPageSize, setInPageSize] = useState(1);
  const [inCount, setInCount] = useState(0);

  // pagination state — "Pindah Keluar" (out)
  const [outPage, setOutPage] = useState(1);
  const [outTotalPages, setOutTotalPages] = useState(1);
  const [outPageSize, setOutPageSize] = useState(1);
  const [outCount, setOutCount] = useState(0);

  const [movementTarget, setMovementTarget] = useState<MovementTarget | null>(null);
  const [addItemOpen, setAddItemOpen] = useState(false);

  const fetchSourceStocks = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/source-inventory/`, {
        params: { source, page: inPage },
      });
      const data: PaginatedResponse<SourceStock> | SourceStock[] = res.data;
      const results = getResults(data);
      setSourceStocks(results);

      const meta = getPageMeta(data, results.length || 1);
      setInPageSize(meta.page_size);
      setInCount(meta.count);
      setInTotalPages(Math.max(1, Math.ceil(meta.count / meta.page_size)));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutItems = async () => {
    setLoading(true);
    try {
      const res = await API.get("/inventory/with-stock/", {
        params: { page: outPage },
      });
      const data: PaginatedResponse<ItemWithStock> | ItemWithStock[] = res.data;
      const results = getResults(data);
      setOutItems(results);

      const meta = getPageMeta(data, results.length || 1);
      setOutPageSize(meta.page_size);
      setOutCount(meta.count);
      setOutTotalPages(Math.max(1, Math.ceil(meta.count / meta.page_size)));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // reset to page 1 whenever the source filter changes
  useEffect(() => {
    setInPage(1);
  }, [source]);

  useEffect(() => {
    if (tab === "in") fetchSourceStocks();
  }, [tab, source, inPage]);

  useEffect(() => {
    if (tab === "out") fetchOutItems();
  }, [tab, outPage]);

  const kitchens: Kitchen[] =
    outItems[0]?.kitchens.map((k) => ({ id: k.kitchen_id, code: k.kitchen_name })) ?? [];

  const handleSubmitMovement = async (data: {
    quantity: number;
    kitchenId?: number;
    isFoodbank?: boolean;
    unitPrice?: number;
    remarks: string;
    image: File | null;
  }) => {
    if (!movementTarget) return;

    const formData = new FormData();
    formData.append("item", String(movementTarget.id));
    formData.append("quantity", String(data.quantity));
    formData.append("remarks", data.remarks);
    if (data.image) formData.append("proof_image", data.image);

    try {
      if (tab === "in") {
        formData.append("source", source);
        if (data.unitPrice != null && data.unitPrice > 0) {
          formData.append("unit_price", String(data.unitPrice));
        }
        await API.post("/source-inventory/", formData);
        await fetchSourceStocks();
      } else {
        formData.append("kitchen", String(data.kitchenId));
        formData.append("is_foodbank", String(!!data.isFoodbank));
        await API.post("/stock-movements/transfer/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        await fetchOutItems();
      }
      setMovementTarget(null);
    } catch (err) {
      console.log(err);
      alert(tab === "in" ? "Error while saving inventory" : "Failed to transfer stock");
    }
  };

  const sourceLabel = SOURCES.find((s) => s.value === source)?.label ?? source;

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <div>
          <PageHeader title="Inventori" subtitle="Urus stok gudang dan pemindahan dapur di satu tempat." />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
            {(["in", "out"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                  tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {key === "in" ? "Stok Masuk" : "Pindah Keluar"}
              </button>
            ))}
          </div>

          {tab === "in" && (
            <div className="flex items-center gap-3">
              <SourceFilter sources={SOURCES} selected={source} onSelect={setSource} />
              <Button onClick={() => setAddItemOpen(true)}>+ Tambah item</Button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          {tab === "in" ? (
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="p-2 text-left font-bold w-10">Bil.</TableHead>
                    <TableHead className="p-2 text-left font-bold">Item</TableHead>
                    <TableHead className="p-2 text-left font-bold">Jumlah Diterima</TableHead>
                    <TableHead className="p-2 text-left font-bold">Terbaharu Ditambah</TableHead>
                    <TableHead className="p-2 text-left font-bold">Jumlah Harga</TableHead>
                    <TableHead className="p-2 text-left font-bold">Kemas kini terakhir</TableHead>
                    <TableHead className="p-2 text-right font-bold">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7}>Loading...</TableCell>
                    </TableRow>
                  ) : (
                    sourceStocks.map((s, index) => (
                      <TableRow key={s.id} className="border-t">
                        <TableCell className="p-2">{(inPage - 1) * inPageSize + index + 1}</TableCell>
                        <TableCell className="p-2">{s.item_name} — RM {s.price_per_unit}</TableCell>
                        <TableCell className="p-2">{s.total_received}</TableCell>
                        <TableCell className="p-2">{s.latest_added}</TableCell>
                        <TableCell className="p-2">
                          RM {Number(s.total_amount ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="p-2">
                          {s.last_updated ? new Date(s.last_updated).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="p-2 text-right">
                          <Button
                            size="sm"
                            onClick={() =>
                              setMovementTarget({
                                id: s.item,
                                name: s.item_name,
                                unit: "",
                                defaultUnitPrice: s.price_per_unit ? Number(s.price_per_unit) : undefined,
                              })
                            }
                          >
                            Tambah Stok
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>No.</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Warehouse</TableHead>
                    {outItems[0]?.kitchens.map((k) => (
                      <TableHead key={k.kitchen_id} className="text-center">
                        {k.kitchen_name}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10}>Loading...</TableCell>
                    </TableRow>
                  ) : (
                    outItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium w-10">
                          {(outPage - 1) * outPageSize + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-center font-bold">{item.management_stock}</TableCell>
                        {item.kitchens.map((k) => (
                          <TableCell key={k.kitchen_id} className="text-center">
                            <p className="font-semibold">{k.stock}</p>
                            <div className="mt-1">
                              <StatusBadge status={k.status} />
                            </div>
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() =>
                              setMovementTarget({ id: item.id, name: item.name, unit: item.unit })
                            }
                          >
                            Pindahkan
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

        {tab === "in" ? (
          <PaginationControls
            page={inPage}
            totalPages={inTotalPages}
            hasPrevious={inPage > 1}
            hasNext={inPage < inTotalPages}
            onPrevious={() => setInPage(inPage - 1)}
            onNext={() => setInPage(inPage + 1)}
            loading={loading}
            totalCount={inCount}
            pageSize={inPageSize}
            itemLabel="item"
          />
        ) : (
          <PaginationControls
            page={outPage}
            totalPages={outTotalPages}
            hasPrevious={outPage > 1}
            hasNext={outPage < outTotalPages}
            onPrevious={() => setOutPage(outPage - 1)}
            onNext={() => setOutPage(outPage + 1)}
            loading={loading}
            totalCount={outCount}
            pageSize={outPageSize}
            itemLabel="item"
          />
        )}
      </div>

      <StockMovementModal
        mode={tab}
        item={movementTarget}
        sourceLabel={tab === "in" ? sourceLabel : undefined}
        kitchens={kitchens}
        onClose={() => setMovementTarget(null)}
        onSubmit={handleSubmitMovement}
      />

      <AddSourceItemDrawer
        open={addItemOpen}
        source={source}
        sourceLabel={sourceLabel}
        onClose={() => setAddItemOpen(false)}
        onDone={() => {
          setAddItemOpen(false);
          fetchSourceStocks();
        }}
      />
    </RoleGuard>
  );
}