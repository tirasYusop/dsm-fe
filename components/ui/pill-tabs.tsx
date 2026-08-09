type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

export default function PillTabs({ options, value, onChange }: Props) {
  return (
    <div className="flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
        {options.map((opt) => (
            <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                value === opt.value
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            }`}
            >
            {opt.label}
            </button>
        ))}
        </div>
    );
    }