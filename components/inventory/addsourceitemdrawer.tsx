"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import { Button } from "@/components/ui/button";
import type {Item} from "@/types/inventory"


type Props = {
  open: boolean;
  source: string;
  sourceLabel: string;
  onClose: () => void;
  onDone: () => void; 
};

export default function AddSourceItemDrawer({ open, source, sourceLabel, onClose, onDone }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [packageSize, setPackageSize] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [remarks, setRemarks] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    API.get(`/inventory/available/?source=${source}`)
      .then((res) => setItems(res.data))
      .catch((err) => console.log(err));
  }, [open, source]);

  if (!open) return null;

  const selectedItem = items.find((i) => i.id === Number(selectedItemId));
  const canSubmit =
    Number(quantity) > 0 && (creatingNew ? name.trim() && unit.trim() : !!selectedItemId);

  const handleImage = (file: File | null) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const reset = () => {
    setSelectedItemId("");
    setCreatingNew(false);
    setName("");
    setUnit("");
    setPackageSize("");
    setPricePerUnit("");
    setQuantity("");
    setUnitPrice("");
    setRemarks("");
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      let itemId = selectedItem?.id;

      if (creatingNew) {
        const res = await API.post("/inventory/", {
          name,
          unit,
          package_size: packageSize || null,
          price_per_unit: pricePerUnit || null,
        });
        itemId = res.data.id;
      }

      if (!itemId) {
        alert("Please select or create an item");
        return;
      }

      const formData = new FormData();
      formData.append("item", String(itemId));
      formData.append("source", source);
      formData.append("quantity", quantity);
      formData.append("remarks", remarks);
      formData.append("unit_price", unitPrice || selectedItem?.price_per_unit || "");
      if (image) formData.append("proof_image", image);

      await API.post("/source-inventory/", formData);

      reset();
      onDone();
    } catch (err) {
      console.log(err);
      alert("Error while saving inventory");
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
              Tambah Stok · {sourceLabel}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              {creatingNew ? "New item" : "Select item"}
            </h2>
          </div>
          <button onClick={onClose} className="text-xl leading-none text-gray-400 hover:text-gray-600">
            X
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {!creatingNew && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Item</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                >
                  <option value="">Pilih Item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.display_name}
                      {item.price_per_unit ? ` — RM ${item.price_per_unit}` : ""}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="outline" onClick={() => setCreatingNew(true)}>
                  + Baru
                </Button>
              </div>
            </div>
          )}

          {creatingNew && (
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Item name</label>
                <input
                  autoFocus
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  placeholder="Rice"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                    placeholder="kg / pack"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Saiz</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                    placeholder="5"
                    value={packageSize}
                    onChange={(e) => setPackageSize(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Harga setiap pakej (RM) (Default)
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  placeholder="18.50"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setCreatingNew(false)}
              >
                ← Kembali kepada item sedia ada
              </button>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/*<div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Unit price (RM)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="Uses item default if left blank"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>*/}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Catatan</label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="Example: Donation from company"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Imej bukti</label>
            <input type="file" accept="image/*" className="text-sm" onChange={(e) => handleImage(e.target.files?.[0] || null)} />
            {preview && (
              <div className="relative mt-2 h-32 w-32">
                <img src={preview} alt="Preview" className="h-full w-full rounded border object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreview("");
                  }}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={!canSubmit || saving} onClick={handleSubmit}>
            {saving ? "Saving..." : "Tambah Stok"}
          </Button>
        </div>
      </div>
    </div>
  );
}