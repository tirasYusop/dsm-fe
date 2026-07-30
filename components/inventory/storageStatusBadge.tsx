type StorageLike = {
  status: "stored" | "removed" | "expired";
  days_left: number;
  is_past_limit: boolean;
};

export default function StorageStatusBadge({ log }: { log: StorageLike }) {
  let text: string;
  let classes: string;

  if (log.status === "removed") {
    text = "Removed";
    classes = "bg-gray-100 text-gray-600 ring-gray-400/20";
  } else if (log.status === "expired" || log.is_past_limit) {
    text = "Expired";
    classes = "bg-red-50 text-red-700 ring-red-600/20";
  } else if (log.days_left <= 1) {
    text = `Expires in ${log.days_left}d`;
    classes = "bg-amber-50 text-amber-700 ring-amber-600/20";
  } else {
    text = `${log.days_left}d left`;
    classes = "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}>
      {text}
    </span>
  );
}