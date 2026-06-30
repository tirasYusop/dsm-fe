"use client";

import { useState } from "react";
import BaseForm from "@/components/form/BaseForm";
import FormInput from "@/components/form/FormInput";

export default function CreateInventoryPage() {
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log({ name, stock, unit });
      alert("Inventory item created!");

      setName("");
      setStock("");
      setUnit("");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex justify-center">
      <BaseForm
        title="Create Inventory Item"
        subtitle="Add new ingredient if it doesn't exist"
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Create Item"
      >
        <FormInput
          label="Item Name"
          value={name}
          onChange={setName}
          placeholder="Rice, Sugar..."
        />

        <FormInput
          label="Stock Quantity"
          type="number"
          value={stock}
          onChange={setStock}
          placeholder="50"
        />

        <FormInput
          label="Unit"
          value={unit}
          onChange={setUnit}
          placeholder="kg / L / packs"
        />
      </BaseForm>
    </div>
  );
}