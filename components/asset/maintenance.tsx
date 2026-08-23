"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import BaseForm from "@/components/form/BaseForm";
import type{Asset, OngoingMaintenance} from "@/types/asset"

export default function AssetMaintenanceTab() {
  const [mode, setMode] = useState<"send" | "return">("send");
  const [activeAssets, setActiveAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [photoBefore, setPhotoBefore] = useState<File | null>(null);
  const [photoBeforePreview, setPhotoBeforePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [ongoing, setOngoing] = useState<OngoingMaintenance[]>([]);
  const [selectedRecord, setSelectedRecord] = useState("");
  const [endDate, setEndDate] = useState("");
  const [photoAfter, setPhotoAfter] = useState<File | null>(null);
  const [photoAfterPreview, setPhotoAfterPreview] = useState<string | null>(null);
  const [returning, setReturning] = useState(false);

  const fetchActiveAssets = () => {API.get("/assets/active/").then((res) => setActiveAssets(res.data)).catch(console.error);};
  const fetchOngoing = () => {API.get("/asset-maintenance/ongoing/").then((res) => setOngoing(res.data)).catch(console.error);};

  useEffect(() => {
    fetchActiveAssets();
    fetchOngoing();
  }, []);

  const selectedActiveAsset = activeAssets.find((a) => String(a.id) === selectedAsset);
  const selectedOngoingRecord = ongoing.find((r) => String(r.id) === selectedRecord);

  const handlePhotoBeforeChange = (file: File | null) => {
    setPhotoBefore(file);
    setPhotoBeforePreview(file ? URL.createObjectURL(file) : null);
  };

  const handlePhotoAfterChange = (file: File | null) => {
    setPhotoAfter(file);
    setPhotoAfterPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAsset || !startDate || !quantity) {
      alert("Sila pilih aset, kuantiti dan tarikh mula penyelenggaraan.");
      return;
    }

    if (selectedActiveAsset && Number(quantity) > selectedActiveAsset.available_quantity) {
      alert(`Hanya ${selectedActiveAsset.available_quantity} unit tersedia.`);
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("asset", selectedAsset);
      formData.append("quantity", quantity);
      formData.append("start_date", startDate);
      formData.append("notes", notes);
      if (photoBefore) formData.append("photo_before", photoBefore);

      await API.post("/asset-maintenance/", formData);

      alert("Aset dihantar untuk penyelenggaraan!");
      setSelectedAsset("");
      setQuantity("1");
      setStartDate("");
      setNotes("");
      handlePhotoBeforeChange(null);
      fetchActiveAssets();
      fetchOngoing();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Gagal merekod penyelenggaraan");
    } finally {
      setSending(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRecord || !endDate) {
      alert("Sila pilih rekod dan tarikh pemulangan.");
      return;
    }

    setReturning(true);
    try {
      const formData = new FormData();
      formData.append("end_date", endDate);
      if (photoAfter) formData.append("photo_after", photoAfter);

      await API.patch(`/asset-maintenance/${selectedRecord}/`, formData);

      alert("Aset ditandakan sebagai dipulangkan!");
      setSelectedRecord("");
      setEndDate("");
      handlePhotoAfterChange(null);
      fetchActiveAssets();
      fetchOngoing();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Gagal mengemaskini rekod");
    } finally {
      setReturning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1 rounded-full bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setMode("send")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "send" ? "bg-white text-gray-900 shadow" : "text-gray-500"
          }`}
        >
          Hantar untuk Penyelenggaraan
        </button>
        <button
          type="button"
          onClick={() => setMode("return")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "return" ? "bg-white text-gray-900 shadow" : "text-gray-500"
          }`}
        >
          Status Penyelengaraan
        </button>
      </div>

      {mode === "send" ? (
        <BaseForm
          title="Hantar Aset untuk Penyelenggaraan"
          subtitle="Rekod unit yang dibawa keluar dari dapur untuk diselenggara"
          onSubmit={handleSend}
          loading={sending}
          submitText="Hantar Aset"
        >
          <div>
            <label className="text-sm font-medium">Pilih Aset</label>
            <select
              value={selectedAsset}
              onChange={(e) => {
                setSelectedAsset(e.target.value);
                setQuantity("1");
              }}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="">Pilih aset</option>
              {activeAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} - {a.name_brand} ({a.available_quantity} unit tersedia)
                </option>
              ))}
            </select>
            {activeAssets.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">Tiada aset tersedia buat masa ini.</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Lokasi Semasa</label>
            <input
              value={selectedActiveAsset?.location_name ?? ""}
              disabled
              className="w-full border rounded px-3 py-2 mt-1 bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Kuantiti Dihantar</label>
            <input
              type="number"
              min={1}
              max={selectedActiveAsset?.available_quantity ?? undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
            {selectedActiveAsset && (
              <p className="mt-1 text-xs text-gray-400">
                Maksimum {selectedActiveAsset.available_quantity} unit tersedia.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Tarikh Mula Penyelenggaraan</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Nota (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Gambar Sebelum Dihantar (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoBeforeChange(e.target.files?.[0] ?? null)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
            {photoBeforePreview && (
              <img
                src={photoBeforePreview}
                alt="Pratonton sebelum"
                className="mt-2 h-28 w-28 rounded-lg border object-cover"
              />
            )}
          </div>
        </BaseForm>
      ) : (
        <BaseForm
          title="Tandakan Pemulangan Aset"
          subtitle="Rekod tarikh unit dipulangkan selepas penyelenggaraan selesai"
          onSubmit={handleReturn}
          loading={returning}
          submitText="Status Penyelengaraan"
        >
          <div>
            <label className="text-sm font-medium">Pilih Rekod Penyelenggaraan</label>
            <select
              value={selectedRecord}
              onChange={(e) => setSelectedRecord(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="">Pilih rekod</option>
              {ongoing.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.asset} - {r.asset_name} — {r.quantity} unit (mula {new Date(r.start_date).toLocaleDateString("en-MY")})
                </option>
              ))}
            </select>
            {ongoing.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">Tiada aset sedang dalam penyelenggaraan.</p>
            )}
          </div>

          {selectedOngoingRecord?.photo_before && (
            <div>
              <label className="text-sm font-medium">Gambar Semasa Dihantar</label>
              <img
                src={selectedOngoingRecord.photo_before}
                alt="Gambar sebelum"
                className="mt-1 h-28 w-28 rounded-lg border object-cover"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Kuantiti (rujukan)</label>
            <input
              value={selectedOngoingRecord ? `${selectedOngoingRecord.quantity} unit` : ""}
              disabled
              className="w-full border rounded px-3 py-2 mt-1 bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tarikh Pulang</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Gambar Bukti Pulang (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoAfterChange(e.target.files?.[0] ?? null)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
            {photoAfterPreview && (
              <img
                src={photoAfterPreview}
                alt="Pratonton selepas"
                className="mt-2 h-28 w-28 rounded-lg border object-cover"
              />
            )}
          </div>
        </BaseForm>
      )}
    </div>
  );
}