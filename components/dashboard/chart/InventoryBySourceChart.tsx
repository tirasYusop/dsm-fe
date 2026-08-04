import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export type SourceBreakdown = {
    source: string;
    label: string;
    color: string;

    totalReceived: number;
    itemCount: number;

    totalAmount: number;
};

export default function InventoryBySourceChart({
  data,
  loading,
}: {
  data: SourceBreakdown[];
  loading: boolean;
}) {
  return (
    <div className="lg:col-span-3 border rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-lg text-[#16211C]">Inventori Mengikut Sumber</h2>
      </div>
      <p className="text-sm text-[#5B7B87] mb-4">Jumlah kuantiti yang diterima mengikut sumber, sepanjang masa.</p>

      {loading ? (
        <p className="text-sm text-[#9CA3AF] py-10 text-center">Loading...</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#E5E9E7" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#5B7B87" }} />
              <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 13, fill: "#16211C" }} />
              <Tooltip
                cursor={{ fill: "#F3F6F5" }}
                contentStyle={{ borderRadius: 10, border: "1px solid #E5E9E7", fontSize: 13 }}
              />
              <Bar dataKey="totalReceived" radius={[0, 6, 6, 0]} barSize={22}>
                {data.map((entry) => (
                  <Cell key={entry.source} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#E5E9E7]">
            {data.map((s) => (
              <div key={s.source} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-[#5B7B87]">
                  {s.label} <span className="font-semibold text-[#16211C]">{s.totalReceived}</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}