"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import BaseForm from "@/components/form/BaseForm";
import type {Asset} from "@/types/asset";

export default function AssetDisposalTab() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [disposalDate, setDisposalDate] = useState("");
  const [reason, setReason] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAssets = () => {
    API.get("/assets/active/")
      .then((res) => setAssets(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const selected = assets.find((a) => String(a.id) === selectedAsset);

  const handlePhotoChange = (file: File | null) => {
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAsset || !disposalDate || !reason || !quantity) {
      alert("Sila lengkapkan semua ruangan.");
      return;
    }

    if (selected && Number(quantity) > selected.available_quantity) {
      alert(`Hanya ${selected.available_quantity} unit tersedia untuk dilupuskan.`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("asset", selectedAsset);
      formData.append("quantity", quantity);
      formData.append("disposal_date", disposalDate);
      formData.append("reason", reason);
      if (photo) formData.append("photo", photo);

      await API.post("/asset-disposal/", formData);

      alert("Disposal record saved!");
      setSelectedAsset("");
      setQuantity("1");
      setDisposalDate("");
      setReason("");
      handlePhotoChange(null);
      fetchAssets();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Gagal menyimpan rekod pelupusan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <BaseForm
        title="Daftar Pelupusan Aset"
        subtitle="Rekod pelupusan bagi aset sedia ada"
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Simpan Rekod Pelupusan"
      >
        <div>
          <label className="text-sm font-medium">Pilih Aset ID</label>
          <select
            value={selectedAsset}
            onChange={(e) => {
              setSelectedAsset(e.target.value);
              setQuantity("1");
            }}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="">Pilih asset</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.id} - {a.name_brand} ({a.available_quantity} unit tersedia)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Nama Asset</label>
          <input
            value={selected?.name_brand ?? ""}
            disabled
            className="w-full border rounded px-3 py-2 mt-1 bg-gray-50 text-gray-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Kuantiti Dilupuskan</label>
          <input
            type="number"
            min={1}
            max={selected?.available_quantity ?? undefined}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
          {selected && (
            <p className="mt-1 text-xs text-gray-400">
              Maksimum {selected.available_quantity} unit tersedia.
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Tarikh Pelupusan</label>
          <input
            type="date"
            value={disposalDate}
            onChange={(e) => setDisposalDate(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Lokasi Terakhir Aset</label>
          <input
            value={selected?.location_name ?? ""}
            disabled
            className="w-full border rounded px-3 py-2 mt-1 bg-gray-50 text-gray-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Sebab Pelupusan</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Gambar Bukti Pelupusan (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Pratonton pelupusan"
              className="mt-2 h-28 w-28 rounded-lg border object-cover"
            />
          )}
        </div>
      </BaseForm>
    </div>
  );
}