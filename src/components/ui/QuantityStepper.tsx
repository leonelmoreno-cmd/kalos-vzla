interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/** Control compacto de cantidad con botones + y −. */
export function QuantityStepper({ value, onChange, min = 1, max = 99 }: QuantityStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="inline-flex items-center rounded-full border border-bloom-200 bg-white">
      <button
        type="button"
        onClick={dec}
        aria-label="Disminuir cantidad"
        className="flex h-9 w-9 items-center justify-center rounded-full text-bloom-700 hover:bg-bloom-100 disabled:opacity-40"
        disabled={value <= min}
      >
        <span className="text-lg leading-none">−</span>
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={inc}
        aria-label="Aumentar cantidad"
        className="flex h-9 w-9 items-center justify-center rounded-full text-bloom-700 hover:bg-bloom-100 disabled:opacity-40"
        disabled={value >= max}
      >
        <span className="text-lg leading-none">+</span>
      </button>
    </div>
  );
}
