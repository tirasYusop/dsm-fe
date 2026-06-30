type Request = {
  id: number;
  item: string;
  quantity: string;
  status: "pending" | "approved" | "rejected";
};

const mockRequests: Request[] = [
  {
    id: 1,
    item: "Cooking Oil",
    quantity: "20 L",
    status: "pending",
  },
  {
    id: 2,
    item: "Rice",
    quantity: "50 kg",
    status: "approved",
  },
];

export default function PendingRequests() {
  return (
    <div className="p-4 rounded-xl border bg-white">
      <h2 className="text-lg font-semibold mb-4">Pending Requests</h2>

      <div className="space-y-3">
        {mockRequests.map((r) => (
          <div
            key={r.id}
            className="flex justify-between items-center border-b pb-2 text-sm"
          >
            <div>
              <p className="font-medium">{r.item}</p>
              <p className="text-gray-500">{r.quantity}</p>
            </div>

            <span
              className={
                r.status === "approved"
                  ? "text-green-600 font-medium"
                  : r.status === "rejected"
                  ? "text-red-500 font-medium"
                  : "text-yellow-500 font-medium"
              }
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}