type Source = {
  value: string;
  label: string;
};

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
    <div className="flex gap-2">
      {sources.map((s) => (
        <button
          key={s.value}
          onClick={() => onSelect(s.value)}
          className={`px-3 py-1 rounded border ${
            selected === s.value
              ? "bg-green-600 text-white"
              : "bg-white"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}