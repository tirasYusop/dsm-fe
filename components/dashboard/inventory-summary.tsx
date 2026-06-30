export default function InventorySummary() {
  return (
    <div className="p-4 rounded-xl border bg-white space-y-2">
      <h2 className="text-lg font-semibold">Inventory Summary</h2>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Total Items Used</p>
          <p className="font-bold">120 kg</p>
        </div>

        <div>
          <p className="text-gray-500">Remaining Stock</p>
          <p className="font-bold text-green-600">350 kg</p>
        </div>

        <div>
          <p className="text-gray-500">Low Stock Alerts</p>
          <p className="font-bold text-red-500">3 items</p>
        </div>
      </div>
    </div>
  );
}