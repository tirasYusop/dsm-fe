type Usage = {
  item: string;
  quantity: string;
  usedBy: string;
  time: string;
};

const mockUsage: Usage[] = [
  {
    item: "Rice",
    quantity: "10 kg",
    usedBy: "Volunteer A",
    time: "10:30 AM",
  },
  {
    item: "Milk",
    quantity: "5 L",
    usedBy: "Volunteer B",
    time: "11:00 AM",
  },
];

export default function RecentUsage() {
  return (
    <div className="p-4 rounded-xl border bg-white">
      <h2 className="text-lg font-semibold mb-4">Recent Usage</h2>

      <div className="space-y-3">
        {mockUsage.map((u, index) => (
          <div
            key={index}
            className="flex justify-between border-b pb-2 text-sm"
          >
            <div>
              <p className="font-medium">{u.item}</p>
              <p className="text-gray-500">{u.usedBy}</p>
            </div>

            <div className="text-right">
              <p>{u.quantity}</p>
              <p className="text-gray-400 text-xs">{u.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}