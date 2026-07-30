"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import BaseForm from "@/components/form/BaseForm";
import RoleGuard from "@/components/auth/roleguard";

type Asset = {
  id: number;
  name_brand: string;
  location_name: string | null;
};

export default function AssetDisposalForm() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [disposalDate, setDisposalDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/assets/active/")
      .then((res) => setAssets(res.data))
      .catch(console.error);
  }, []);

  const selected = assets.find((a) => String(a.id) === selectedAsset);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAsset || !disposalDate || !reason) {
      alert("Please complete all the fields");
      return;
    }

    setLoading(true);
    try {
      await API.post("/asset-disposal/", {
        asset: Number(selectedAsset),
        disposal_date: disposalDate,
        reason,
      });

      alert("Disposal record saved!");
      setSelectedAsset("");
      setDisposalDate("");
      setReason("");
      const res = await API.get("/assets/active/");
      setAssets(res.data);
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Failed to save disposal record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="flex justify-center">
        <BaseForm
          title="Asset Disposal Register"
          subtitle="Disposal record for existing assets"
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Keep Disposal Records"
        >
          <div>
            <label className="text-sm font-medium">Select Asset ID</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="">Pilih asset</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} - {a.name_brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Asset Name</label>
            <input
              value={selected?.name_brand ?? ""}
              disabled
              className="w-full border rounded px-3 py-2 mt-1 bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Date Disposed</label>
            <input
              type="date"
              value={disposalDate}
              onChange={(e) => setDisposalDate(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Last Location of Asset</label>
            <input
              value={selected?.location_name ?? ""}
              disabled
              className="w-full border rounded px-3 py-2 mt-1 bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Reason for Disposal</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
              rows={3}
            />
          </div>
        </BaseForm>
      </div>
    </RoleGuard>
  );
}