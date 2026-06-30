"use client";

import { useState } from "react";

type RequestItem = {
  id: number;
  item: string;
  quantity: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  date: string;
};

const initialRequests: RequestItem[] = [
  {
    id: 1,
    item: "Rice",
    quantity: 20,
    reason: "Low stock for cooking session",
    status: "pending",
    date: "2026-06-24",
  },
  {
    id: 2,
    item: "Cooking Oil",
    quantity: 10,
    reason: "Used in yesterday cooking",
    status: "approved",
    date: "2026-06-23",
  },
  {
    id: 3,
    item: "Milk",
    quantity: 15,
    reason: "Breakfast preparation",
    status: "rejected",
    date: "2026-06-22",
  },
];

export default function RequestListPage() {
  const [requests, setRequests] = useState(initialRequests);

  // CANCEL (only pending)
  const cancelRequest = (id: number) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id && req.status === "pending"
          ? { ...req, status: "cancelled" }
          : req
      )
    );
  };

  // DELETE (remove from list)
  const deleteRequest = (id: number) => {
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Request History</h1>
      <p className="text-sm text-gray-500">
        Manage your ingredient requests
      </p>

      <div className="space-y-3 mt-4">
        {requests.map((req) => {
          let color = "";

          if (req.status === "approved") color = "text-green-600";
          if (req.status === "pending") color = "text-yellow-600";
          if (req.status === "rejected") color = "text-red-600";
          if (req.status === "cancelled") color = "text-gray-500";

          return (
            <div
              key={req.id}
              className="border rounded-lg p-4 bg-white flex justify-between items-center"
            >
              {/* LEFT */}
              <div>
                <p className="font-medium">{req.item}</p>
                <p className="text-sm text-gray-500">
                  Qty: {req.quantity} | {req.reason}
                </p>
                <p className="text-xs text-gray-400">{req.date}</p>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-4">
                {/* STATUS */}
                <div className={`text-sm font-semibold ${color}`}>
                  {req.status.toUpperCase()}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 text-sm">
                  {/* Cancel (only pending) */}
                  {req.status === "pending" && (
                    <button
                      onClick={() => cancelRequest(req.id)}
                      className="text-yellow-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}

                  {/* Delete (all except pending approved active safety rule) */}
                  <button
                    onClick={() => deleteRequest(req.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}