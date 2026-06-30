"use client";

import { useState } from "react";
import BaseForm from "@/components/form/BaseForm";
import FormInput from "@/components/form/FormInput";

export default function RequestForm() {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log({ item, quantity, reason });
      alert("Request submitted!");

      setItem("");
      setQuantity("");
      setReason("");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex item-center justify-center p-6 space-y-6">
      <BaseForm
        title="Request Ingredients"
        subtitle="Submit request ingredients"
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Submit Request"
      >
        <FormInput
          label="Item Name"
          value={item}
          onChange={setItem}
          placeholder="Rice, Milk..."
        />

        <FormInput
          label="Quantity"
          type="number"
          value={quantity}
          onChange={setQuantity}
          placeholder="10"
        />

        <div>
          <label className="text-sm font-medium">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            rows={3}
          />
        </div>
      </BaseForm>
    </div>

  );
}