import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export type FacultyAttendance = {
  faculty: string;
  count: number;
};

const COLORS = [
  "#114B44",
  "#1B6F63",
  "#2D8C7D",
  "#4FA89A",
  "#73C2B5",
  "#9AD9CF",
  "#C3ECE6",
];

export default function FacultyAttendanceChart({
  data,
  loading,
}: {
  data: FacultyAttendance[];
  loading: boolean;
}) {
  return (
    <div className="lg:col-span-2 border rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-lg text-[#16211C] mb-1">
        Kehadiran Mengikut Fakulti
      </h2>
      <p className="text-sm text-[#5B7B87] mb-4">
        Jumlah kehadiran keseluruhan, gabungan daftar masuk terus (walk-in) dan tempahan.
      </p>

      {loading ? (
        <p className="text-sm text-[#9CA3AF] py-10 text-center">
          Loading...
        </p>
      ) : data.length === 0 ? (
        <p className="text-sm text-[#9CA3AF] py-10 text-center">
          Tiada Rekod Kehadiran .. 
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="faculty"
              cx="50%"
              cy="50%"
              outerRadius={100}
              paddingAngle={2}
             label={({ name, percent }) =>
                `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
              }
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => [String(value ?? 0), "Attendance"]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #E5E9E7",
                fontSize: 13,
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}