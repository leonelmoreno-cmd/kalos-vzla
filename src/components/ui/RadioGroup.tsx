interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface RadioGroupProps<T extends string> {
  name: string;
  value: T | '';
  options: Option<T>[];
  onChange: (value: T) => void;
  /** Layout: 'grid' (cards) or 'list'. */
  columns?: 1 | 2 | 3;
}

/** Accessible, card-style single-select radio group. */
export function RadioGroup<T extends string>({
  name,
  value,
  options,
  onChange,
  columns = 1,
}: RadioGroupProps<T>) {
  const cols = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3';
  return (
    <div className={`grid gap-2.5 ${cols}`} role="radiogroup">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
              selected
                ? 'border-bloom-500 bg-bloom-50 ring-1 ring-bloom-300'
                : 'border-gray-200 bg-white hover:border-bloom-300'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 h-4 w-4 accent-bloom-600"
            />
            <span>
              <span className="block text-sm font-medium text-gray-800">{opt.label}</span>
              {opt.hint && <span className="block text-xs text-gray-400">{opt.hint}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
