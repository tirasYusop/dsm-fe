
type Request = {
  id: number;
  item: string;
  quantity: number;
  status: "pending" | "approved" | "rejected";
};

const mockRequests: Request[] = [
  { id: 1, item: "Rice", quantity: 20, status: "pending" },
  { id: 2, item: "Cooking Oil", quantity: 10, status: "approved" },
  { id: 3, item: "Milk", quantity: 15, status: "pending" },
];

export default function ManagementDashboard() {
  return (
      <div className="space-y-6">
        <div className="border rounded-lg bg-white p-4">
          <h2 className="text-lg font-semibold mb-4">
            Pending Requests Approval
          </h2>
        </div>

      </div>
  );
}