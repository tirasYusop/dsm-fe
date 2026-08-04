"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import { Button } from "@/components/ui/button";
import type {StorageLog, Kitchen} from "@/types/kitchen"

function urgencyStyles(log: StorageLog) {
  if (log.status === "removed") {
    return { text: "Removed", classes: "bg-gray-100 text-gray-600 ring-gray-400/20" };
  }
  if (log.status === "expired" || log.is_past_limit) {
    return { text: "Expired", classes: "bg-red-50 text-red-700 ring-red-600/20" };
  }
  if (log.days_left <= 1) {
    return { text: `Expires in ${log.days_left}d`, classes: "bg-amber-50 text-amber-700 ring-amber-600/20" };
  }
  return { text: `${log.days_left}d left`, classes: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" };
}

export default function StudentStoragePage() {
  const [logs, setLogs] = useState<StorageLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState("");
  const [itemName, setItemName] = useState("");
  const [dateStored, setDateStored] = useState(() => new Date().toISOString().slice(0, 10));
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchKitchens = async () => {
    try {
      const res = await API.get("/kitchens/"); 
      setKitchens(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get("/student-storage/");
      setLogs(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
    fetchLogs();
  }, []);

  const handleImage = (file: File | null) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async () => {
    if (!itemName.trim()) {
      alert("Please enter the item name");
      return;
    }
    if (!selectedKitchen) {
      alert("Please select a kitchen");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("item_name", itemName);
      formData.append("kitchen", selectedKitchen);
      formData.append("date_stored", dateStored);
      if (image) formData.append("proof_image", image);

      await API.post("/student-storage/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setItemName("");
      setSelectedKitchen("");
      setDateStored(new Date().toISOString().slice(0, 10));
      setImage(null);
      setPreview("");
      fetchLogs();
    } catch (err) {
      console.log(err);
      alert("Error while saving storage log");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await API.post(`/student-storage/${id}/remove/`);
      fetchLogs();
    } catch (err) {
      console.log(err);
      alert("Error while marking as removed");
    }
  };

  return (
    <RoleGuard allowedRoles={["student"]}>
      <div className="mx-auto max-w-2xl space-y-6 sm:p-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Ruang Penyimpanan Dapur</h1>
          <p className="text-sm text-gray-500">
            Catatkan barang yang anda simpan. Sebarang barang yang ditinggalkan melebihi 3 hari akan ditandakan, dan anda serta pihak pengurusan akan dimaklumkan.
          </p>
        </div>

        {/* Log a new item */}
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900">Catatkan item baharu</h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Dapur</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              value={selectedKitchen}
              onChange={(e) => setSelectedKitchen(e.target.value)}
            >
              <option value="">Pilih dapur</option>
              {kitchens.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Nama Item</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="e.g. Chicken breast"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tarikh disimpan</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              value={dateStored}
              onChange={(e) => setDateStored(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Imej bukti <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700"
              onChange={(e) => handleImage(e.target.files?.[0] || null)}
            />
            {preview && (
              <div className="relative mt-2 h-28 w-28">
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

          <Button className="w-full" disabled={saving} onClick={handleSubmit}>
            {saving ? "Saving..." : "Log item"}
          </Button>
        </div>

        {/* Current + past logs */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Log penyimpanan anda</h2>

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-gray-500">Tiada apa-apa yang direkodkan lagi.</p>
          ) : (
            logs.map((log) => {
              const urgency = urgencyStyles(log);
              return (
                <div
                  key={log.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {log.proof_image && (
                      <img
                        src={log.proof_image}
                        alt={log.item_name}
                        className="h-12 w-12 flex-shrink-0 rounded border object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{log.item_name}</p>
                      <p className="truncate text-xs text-gray-500">
                        {log.kitchen_name} · Stored {log.date_stored} · Limit {log.expiry_date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${urgency.classes}`}
                    >
                      {urgency.text}
                    </span>
                    {log.status === "stored" && (
                      <Button size="sm" variant="outline" onClick={() => handleRemove(log.id)}>
                        Tanda dikeluarkan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </RoleGuard>
  );
}