import type { Source } from "@/types/inventory";

type Props = {
  sources: Source[];
  selected: string;
  onSelect: (value: string) => void;
};

export default function SourceFilter({
  sources,
  selected,
  onSelect,
}: Props) {
  return (
    <>
      {/* Mobile: dropdown */}
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm sm:hidden"
      >
        {sources.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Desktop / tablet: pill buttons */}
      <div className="hidden gap-2 sm:flex">
        {sources.map((s) => (
          <button
            key={s.value}
            onClick={() => onSelect(s.value)}
            className={`flex-shrink-0 whitespace-nowrap rounded border px-3 py-1 ${
              selected === s.value
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </>
  );
}