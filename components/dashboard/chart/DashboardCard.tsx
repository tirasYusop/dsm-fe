type DashboardCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
};

export default function DashboardCard({ title, value, icon, accent }: DashboardCardProps) {
  return (
    <div className="border rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[#5B7B87]">{title}</p>
        <span
          className="h-8 w-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accent}22`, color: accent }}
        >
          {icon}
        </span>
      </div>
      <h2 className="text-3xl font-bold text-[#16211C]">{value}</h2>
    </div>
  );
}