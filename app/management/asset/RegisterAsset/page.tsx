"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import BaseForm from "@/components/form/BaseForm";
import FormInput from "@/components/form/FormInput";
import RoleGuard from "@/components/auth/roleguard";

type Kitchen = {
  id: number;
  code: string;
};

const SOURCE_OPTIONS = [
  { value: "purchase", label: "Purchase" },
  { value: "donation", label: "Donation" },
  { value: "sponsor", label: "Sponsor" },
  { value: "other", label: "Other" },
];

export default function AssetRegistrationForm() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [nameBrand, setNameBrand] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warranty, setWarranty] = useState("");
  const [price, setPrice] = useState("");
  const [sourceType, setSourceType] = useState("Purchase");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/kitchens/")
      .then((res) => setKitchens(res.data))
      .catch(console.error);
  }, []);

  const resetForm = () => {
    setNameBrand("");
    setPurchaseDate("");
    setWarranty("");
    setPrice("");
    setSourceType("purchase");
    setLocation("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameBrand || !purchaseDate || !price || !location) {
      alert("Please fill in all the required fields");
      return;
    }

    setLoading(true);
    try {
      await API.post("/assets/", {
        name_brand: nameBrand,
        purchase_date: purchaseDate,
        warranty,
        price: Number(price),
        source_type: sourceType,
        location: Number(location),
      });

      alert("Asset successfully registered!");
      resetForm();
    } catch (err: any) {
      console.error(err.response?.data);
      alert(err?.response?.data?.error ?? "Failed to register asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="flex justify-center">
        <BaseForm
          title="New Asset Registration Form"
          subtitle="Register new assets into the system"
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Register Asset"
        >
          <FormInput
            label="Asset Name & Brand"
            value={nameBrand}
            onChange={setNameBrand}
            placeholder="ex: Peti Sejuk Panasonic"
          />

          <div>
            <label className="text-sm font-medium">Date Purchased</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <FormInput
            label="Waranty Asset"
            value={warranty}
            onChange={setWarranty}
            placeholder="exp: 1 Year"
          />

          <FormInput
            label="Asset Price (RM)"
            type="number"
            value={price}
            onChange={setPrice}
            placeholder="500.00"
          />

          <div>
            <label className="text-sm font-medium">Type of Purchase Source</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Asset Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="">Choose location</option>
              {kitchens.map((k) => (
                <option key={k.id} value={k.id}>{k.code}</option>
              ))}
            </select>
          </div>
        </BaseForm>
      </div>
    </RoleGuard>
  );
}