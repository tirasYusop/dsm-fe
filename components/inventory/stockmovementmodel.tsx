"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type {StockMovementSubmitData} from "@/types/inventory"

export type Kitchen = { id: number; code: string };

type Props = {
  mode: "in" | "out";
  item: { id: number; name: string; unit: string } | null;
  sourceLabel?: string; 
  kitchens?: Kitchen[]; 
  onClose: () => void;
  onSubmit: (data: StockMovementSubmitData) => Promise<void>;
};

export default function StockMovementModal({
  mode,
  item,
  sourceLabel,
  kitchens = [],
  onClose,
  onSubmit,
}: Props) {
  const [quantity, setQuantity] = useState("");
  const [kitchenId, setKitchenId] = useState("");
  const [transferType, setTransferType] = useState<"kitchen" | "foodbank">("kitchen");
  const [unitPrice, setUnitPrice] = useState("");
  const [remarks, setRemarks] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!item) return null;

  const isOut = mode === "out";
  const canSubmit = Number(quantity) > 0 && (!isOut || kitchenId);

  const handleImage = (file: File | null) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
  };

  const reset = () => {
    setQuantity("");
    setKitchenId("");
    setTransferType("kitchen");
    setUnitPrice("");
    setRemarks("");
    setImage(null);
    setPreview("");
    setShowDetails(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        quantity: Number(quantity),
        kitchenId: isOut ? Number(kitchenId) : undefined,
        isFoodbank: isOut ? transferType === "foodbank" : undefined,
        unitPrice: isOut ? undefined : Number(unitPrice) || 0,
        remarks,
        image,
      });
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {isOut ? "Transfer stock" : "Add stock"}
            {!isOut && sourceLabel ? ` · ${sourceLabel}` : ""}
          </p>
          <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
        </div>

        <div className="space-y-4 px-5 py-4">
          {isOut && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Transfer type</label>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
                  {(["kitchen", "foodbank"] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTransferType(key)}
                      className={`rounded-md py-1.5 text-sm font-medium transition ${
                        transferType === key
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {key === "kitchen" ? "Kitchen supply" : "Foodbank"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Send to kitchen</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  value={kitchenId}
                  onChange={(e) => setKitchenId(e.target.value)}
                >
                  <option value="">Select kitchen</option>
                  {kitchens.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.code}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Quantity <span className="font-normal text-gray-400">({item.unit})</span>
            </label>
            <input
              type="number"
              autoFocus
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            {showDetails ? "− Hide details" : "+ Add details (optional)"}
          </button>

          {showDetails && (
            <div className="space-y-3 rounded-lg bg-gray-50 p-3">
              {!isOut && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Unit price (RM)</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                    placeholder="Uses item default if left blank"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Remarks</label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  placeholder="Optional notes"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Proof image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm"
                  onChange={(e) => handleImage(e.target.files?.[0] || null)}
                />
                {preview && (
                  <div className="relative mt-2 h-32 w-32">
                    <img src={preview} alt="Preview" className="h-full w-full rounded border object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white hover:bg-red-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? "Saving..." : isOut ? "Confirm transfer" : "Add stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}