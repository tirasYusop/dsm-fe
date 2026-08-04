"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import { Badge } from "@/components/ui/badge";
import { X, Pencil } from "lucide-react";
import type {OverviewAsset,EditForm } from "@/types/asset"
import type {Kitchen} from "@/types/kitchen"

const SOURCE_OPTIONS = [
  { value: "purchase", label: "Pembelian" },
  { value: "donation", label: "Sumbangan" },
  { value: "sponsor", label: "Penaja" },
  { value: "other", label: "Lain-lain" },
];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  maintenance: "bg-amber-100 text-amber-700",
  disposed: "bg-red-100 text-red-700",
};

type Props = {
  asset: OverviewAsset | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function AssetDetailPanel({ asset, onClose, onUpdated }: Props) {
  const [editing, setEditing] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [form, setForm] = useState<EditForm | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  useEffect(() => {
    setEditing(false);
    setForm(null);
    setNewImage(null);
    setNewImagePreview(null);
  }, [asset?.id]);

  if (!asset) return null;

  const maintenanceEntries = asset.transactions.filter((t) => t.type === "maintenance");
  const disposalEntries = asset.transactions.filter((t) => t.type === "disposal");
  const committedQuantity = asset.in_maintenance_quantity + asset.disposed_quantity;

  const startEdit = async () => {
    setLoadingDetail(true);
    try {
      const [assetRes, kitchensRes] = await Promise.all([
        API.get(`/assets/${asset.id}/`),
        kitchens.length ? Promise.resolve({ data: kitchens }) : API.get("/kitchens/"),
      ]);
      setKitchens(kitchensRes.data);

      const a = assetRes.data;
      setForm({
        name_brand: a.name_brand,
        purchase_date: a.purchase_date,
        warranty: a.warranty ?? "",
        price: String(a.price),
        quantity: String(a.quantity),
        source_type: a.source_type,
        location: a.location ? String(a.location) : "",
      });
      setEditing(true);
    } catch (err) {
      console.error(err);
      alert("Gagal memuatkan butiran aset untuk disunting");
    } finally {
      setLoadingDetail(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm(null);
    setNewImage(null);
    setNewImagePreview(null);
  };

  const handleImageChange = (file: File | null) => {
    setNewImage(file);
    setNewImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSave = async () => {
    if (!form) return;

    if (!form.name_brand || !form.purchase_date || !form.price || !form.location || !form.quantity) {
      alert("Sila lengkapkan semua ruangan yang diperlukan.");
      return;
    }

    if (Number(form.quantity) < committedQuantity) {
      alert(`Kuantiti tidak boleh kurang daripada ${committedQuantity} (unit yang sudah direkodkan).`);
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name_brand", form.name_brand);
      formData.append("purchase_date", form.purchase_date);
      formData.append("warranty", form.warranty);
      formData.append("price", form.price);
      formData.append("quantity", form.quantity);
      formData.append("source_type", form.source_type);
      formData.append("location", form.location);
      if (newImage) formData.append("image", newImage);

      await API.patch(`/assets/${asset.id}/`, formData);

      alert("Aset berjaya dikemaskini!");
      cancelEdit();
      onUpdated();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Gagal mengemaskini aset");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            #{asset.id} - {asset.name_brand}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image */}
        <div className="mb-4">
          {editing ? (
            <div>
              {(newImagePreview || asset.image) && (
                <img
                  src={newImagePreview ?? asset.image ?? ""}
                  alt={asset.name_brand}
                  className="h-40 w-40 rounded-lg border object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                className="mt-2 w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          ) : asset.image ? (
            <a href={asset.image} target="_blank" rel="noreferrer">
              <img
                src={asset.image}
                alt={asset.name_brand}
                className="h-40 w-40 rounded-lg border object-cover"
              />
            </a>
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-lg border bg-gray-50 text-xs text-gray-400">
              Tiada gambar
            </div>
          )}
        </div>

        {!editing ? (
          <>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Tarikh Pembelian</dt>
                <dd>{new Date(asset.purchase_date).toLocaleDateString("en-MY")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Lokasi</dt>
                <dd>{asset.original_location ?? "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <Badge className={STATUS_STYLES[asset.status] ?? "bg-gray-100 text-gray-700"}>
                    {asset.status_display}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Kuantiti</dt>
                <dd>
                  {asset.quantity} jumlah ({asset.available_quantity} tersedia)
                </dd>
              </div>
            </dl>

            <button
              onClick={startEdit}
              disabled={loadingDetail}
              className="mt-4 flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              {loadingDetail ? "Memuatkan..." : "Sunting Aset"}
            </button>

            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Penyelenggaraan</h3>
              {maintenanceEntries.length === 0 ? (
                <p className="text-xs text-gray-400">Tiada rekod.</p>
              ) : (
                <ul className="space-y-2">
                  {maintenanceEntries.map((t, i) => (
                    <li key={i} className="rounded-lg border p-2 text-xs">
                      <div className="font-medium text-gray-900">
                        {t.quantity} unit — {new Date(t.date).toLocaleDateString("en-MY")} –{" "}
                        {t.end_date ? new Date(t.end_date).toLocaleDateString("en-MY") : "sedang berjalan"}
                      </div>
                      {t.notes && <div className="mt-0.5 text-gray-500">{t.notes}</div>}
                      {(t.photo_before || t.photo_after) && (
                        <div className="mt-1.5 flex gap-1.5">
                          {t.photo_before && (
                            <a href={t.photo_before} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                              <img src={t.photo_before} alt="Sebelum" className="h-10 w-10 rounded border object-cover" />
                            </a>
                          )}
                          {t.photo_after && (
                            <a href={t.photo_after} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                              <img src={t.photo_after} alt="Selepas" className="h-10 w-10 rounded border object-cover" />
                            </a>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Pelupusan</h3>
              {disposalEntries.length === 0 ? (
                <p className="text-xs text-gray-400">Tiada rekod.</p>
              ) : (
                <ul className="space-y-2">
                  {disposalEntries.map((t, i) => (
                    <li key={i} className="rounded-lg border p-2 text-xs">
                      <div className="font-medium text-gray-900">
                        {t.quantity} unit — {new Date(t.date).toLocaleDateString("en-MY")}
                      </div>
                      {t.notes && <div className="mt-0.5 text-gray-500">{t.notes}</div>}
                      {t.photo && (
                        <a
                          href={t.photo}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1.5 inline-block"
                        >
                          <img src={t.photo} alt="Bukti" className="h-10 w-10 rounded border object-cover" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          form && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Nama & Jenama Aset</label>
                <input
                  value={form.name_brand}
                  onChange={(e) => setForm({ ...form, name_brand: e.target.value })}
                  className="w-full rounded border px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tarikh Pembelian</label>
                <input
                  type="date"
                  value={form.purchase_date}
                  onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                  className="w-full rounded border px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Waranti</label>
                <input
                  value={form.warranty}
                  onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                  className="w-full rounded border px-3 py-2 mt-1"
                  placeholder="exp: 1 Year"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Harga Aset (RM)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded border px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Kuantiti</label>
                <input
                  type="number"
                  min={committedQuantity}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full rounded border px-3 py-2 mt-1"
                />
                {committedQuantity > 0 && (
                  <p className="mt-1 text-xs text-gray-400">
                    Minimum {committedQuantity} (sudah direkodkan dalam penyelenggaraan/pelupusan).
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Jenis Sumber Pembelian</label>
                <select
                  value={form.source_type}
                  onChange={(e) => setForm({ ...form, source_type: e.target.value })}
                  className="w-full rounded border px-3 py-2 mt-1"
                >
                  {SOURCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Lokasi Aset</label>
                <select
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded border px-3 py-2 mt-1"
                >
                  <option value="">Choose location</option>
                  {kitchens.map((k) => (
                    <option key={k.id} value={k.id}>{k.code}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}