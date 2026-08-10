type Status = "available" | "low" | "out";

const STATUS_MAP: Record<Status, { text: string; classes: string }> = {
  available: { text: "Tersedia", classes: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  low: { text: "Stok Rendah", classes: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  out: { text: "Habis", classes: "bg-red-50 text-red-700 ring-red-600/20" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status as Status] ?? STATUS_MAP.available;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${s.classes}`}
    >
      {s.text}
    </span>
  );
}