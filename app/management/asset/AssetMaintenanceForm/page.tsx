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

export default function AssetMaintenanceForm() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/assets/active/")
      .then((res) => setAssets(res.data))
      .catch(console.error);
  }, []);

  const selected = assets.find((a) => String(a.id) === selectedAsset);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAsset || !maintenanceDate) {
      alert("Please choose an asset and a maintenance date");
      return;
    }

    setLoading(true);
    try {
      await API.post("/asset-maintenance/", {
        asset: Number(selectedAsset),
        maintenance_date: maintenanceDate,
        notes,
      });

      alert("Maintenance record saved!");
      setSelectedAsset("");
      setMaintenanceDate("");
      setNotes("");
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Failed to save record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="flex justify-center">
        <BaseForm
          title="Register Asset Maintenance "
          subtitle="Maintenance records for existing assets"
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Save Maintenance Records"
        >
          <div>
            <label className="text-sm font-medium">Select Asset ID</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="">Select asset</option>
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
            <label className="text-sm font-medium">Date Organized</label>
            <input
              type="date"
              value={maintenanceDate}
              onChange={(e) => setMaintenanceDate(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Current Location</label>
            <input
              value={selected?.location_name ?? ""}
              disabled
              className="w-full border rounded px-3 py-2 mt-1 bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
              rows={3}
            />
          </div>
        </BaseForm>
      </div>
    </RoleGuard>
  );
}