"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import { Button } from "@/components/ui/button";

type Item = {
  id: number;
  name: string;
  display_name: string;
  unit: string;
  package_size: string | null;
  price_per_unit: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onDone: () => void; // parent refetches the request list
};

export default function RequestFormDrawer({ open, onClose, onDone }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedItem, setSelectedItem] = useState("");

  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [newItemPackageSize, setNewItemPackageSize] = useState("");
  const [newItemPricePerUnit, setNewItemPricePerUnit] = useState("");

  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    API.get("/inventory/")
      .then((res) => setItems(res.data))
      .catch((err) => console.log(err));
  }, [open]);

  if (!open) return null;

  const isExisting = mode === "existing";
  const canSubmit =
    Number(quantity) > 0 &&
    (isExisting ? !!selectedItem : newItemName.trim() && newItemUnit.trim());

  const reset = () => {
    setMode("existing");
    setSelectedItem("");
    setNewItemName("");
    setNewItemUnit("");
    setNewItemPackageSize("");
    setNewItemPricePerUnit("");
    setQuantity("");
    setReason("");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await API.post("/requests/", {
        item: isExisting ? Number(selectedItem) : null,
        new_item_name: isExisting ? null : newItemName,
        new_item_unit: isExisting ? "kg" : newItemUnit,
        new_item_package_size: isExisting ? null : newItemPackageSize || null,
        new_item_price_per_unit: isExisting ? null : newItemPricePerUnit || null,
        quantity: Number(quantity),
        reason,
      });

      reset();
      onDone();
    } catch (err: any) {
      console.log(err.response?.data);
      alert("Failed to submit request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Request ingredients
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              {isExisting ? "Select item" : "New item"}
            </h2>
          </div>
          <button onClick={onClose} className="text-xl leading-none text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                isExisting ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600"
              }`}
            >
              Existing Item
            </button>
            <button
              type="button"
              onClick={() => setMode("new")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                !isExisting ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600"
              }`}
            >
              New Item
            </button>
          </div>

          {isExisting ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Item</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                <option value="">Select item</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.display_name}
                    {i.price_per_unit ? ` — RM ${i.price_per_unit}` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Item name</label>
                <input
                  autoFocus
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  placeholder="e.g. Rice, Sugar"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                    placeholder="kg / pack"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Package size</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                    placeholder="5"
                    value={newItemPackageSize}
                    onChange={(e) => setNewItemPackageSize(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Estimated price per package (RM)
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  placeholder="18.50"
                  value={newItemPricePerUnit}
                  onChange={(e) => setNewItemPricePerUnit(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!canSubmit || saving} onClick={handleSubmit}>
            {saving ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}