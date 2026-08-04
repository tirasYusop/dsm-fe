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
import type {SourceStock,ItemWithStock} from "@/types/inventory"

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

  const [movementTarget, setMovementTarget] = useState<
    { id: number; name: string; unit: string } | null
  >(null);
  const [addItemOpen, setAddItemOpen] = useState(false);

  const fetchSourceStocks = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/source-inventory/?source=${source}`);
      setSourceStocks(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutItems = async () => {
    setLoading(true);
    try {
      const res = await API.get("/inventory/with-stock/");
      setOutItems(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "in") fetchSourceStocks();
  }, [tab, source]);

  useEffect(() => {
    if (tab === "out") fetchOutItems();
  }, [tab]);

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
        formData.append("unit_price", String(data.unitPrice ?? 0));
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
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Inventori</h1>
          <p className="text-sm text-gray-500">Urus stok gudang dan pemindahan dapur di satu tempat.</p>
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
                  <TableHead className="p-2 text-left font-bold">Kemas kini terakhir</TableHead>
                  <TableHead className="p-2 text-right font-bold">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>Loading...</TableCell>
                  </TableRow>
                ) : (
                  sourceStocks.map((s,index) => (
                    <TableRow key={s.id} className="border-t">
                      <TableCell className="p-2">{index + 1}</TableCell>
                      <TableCell className="p-2">{s.item_name} — RM {s.price_per_unit}</TableCell>
                      <TableCell className="p-2">{s.total_received}</TableCell>
                      <TableCell className="p-2">{s.latest_added}</TableCell>
                      <TableCell className="p-2">
                        {s.last_updated ? new Date(s.last_updated).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell className="p-2 text-right">
                        <Button
                          size="sm"
                          onClick={() =>
                            setMovementTarget({ id: s.item, name: s.item_name, unit: "" })
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
                  outItems.map((item,index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{index+1}</TableCell>
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