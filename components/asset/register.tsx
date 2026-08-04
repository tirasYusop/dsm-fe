"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import BaseForm from "@/components/form/BaseForm";
import FormInput from "@/components/form/FormInput";
import type {Kitchen} from "@/types/kitchen"

const SOURCE_OPTIONS = [
  { value: "purchase", label: "Pembelian" },
  { value: "donation", label: "Sumbangan" },
  { value: "sponsor", label: "Penaja" },
  { value: "other", label: "Lain-lain" },
];

export default function AssetRegistrationTab() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [nameBrand, setNameBrand] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warranty, setWarranty] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [sourceType, setSourceType] = useState(SOURCE_OPTIONS[0].value);
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/kitchens/")
      .then((res) => setKitchens(res.data))
      .catch(console.error);
  }, []);

  const handleImageChange = (file: File | null) => {
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const resetForm = () => {
    setNameBrand("");
    setPurchaseDate("");
    setWarranty("");
    setPrice("");
    setQuantity("1");
    setSourceType("purchase");
    setLocation("");
    handleImageChange(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameBrand || !purchaseDate || !price || !location || !quantity) {
      alert("Sila lengkapkan semua ruangan yang diperlukan.");
      return;
    }

    if (Number(quantity) < 1) {
      alert("Kuantiti mesti sekurang-kurangnya 1.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name_brand", nameBrand);
      formData.append("purchase_date", purchaseDate);
      formData.append("warranty", warranty);
      formData.append("price", price);
      formData.append("quantity", quantity);
      formData.append("source_type", sourceType);
      formData.append("location", location);
      if (image) formData.append("image", image);

      await API.post("/assets/", formData);
      alert("Aset berjaya didaftarkan!");
      resetForm();
    } catch (err: any) {
      console.error(err.response?.data);
      alert(err?.response?.data?.error ?? "Gagal mendaftar aset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <BaseForm
        title="Borang Pendaftaran Aset Baharu"
        subtitle="Daftarkan aset baharu ke dalam sistem"
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Daftar Aset"
      >
        <FormInput
          label="Nama & Jenama Aset"
          value={nameBrand}
          onChange={setNameBrand}
          placeholder="ex: Peti Sejuk Panasonic"
        />

        <div>
          <label className="text-sm font-medium">Tarikh Pembelian</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <FormInput
          label="Aset Waranti"
          value={warranty}
          onChange={setWarranty}
          placeholder="exp: 1 Year"
        />

        <FormInput
          label="Harga Aset (RM)"
          type="number"
          value={price}
          onChange={setPrice}
          placeholder="500.00"
        />

        <div>
          <label className="text-sm font-medium">Kuantiti</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="1"
          />
          <p className="mt-1 text-xs text-gray-400">
            Cth: 5 jika mendaftar 5 kerusi serupa sekaligus.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Jenis Sumber Pembelian</label>
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
          <label className="text-sm font-medium">Lokasi Aset</label>
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

        <div>
          <label className="text-sm font-medium">Gambar Aset (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Pratonton aset"
              className="mt-2 h-28 w-28 rounded-lg border object-cover"
            />
          )}
        </div>
      </BaseForm>
    </div>
  );
}