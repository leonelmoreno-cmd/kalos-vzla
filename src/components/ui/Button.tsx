import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-bloom-700 text-white hover:bg-bloom-800 focus:ring-bloom-300',
  secondary: 'bg-bloom-100 text-bloom-700 hover:bg-bloom-200 focus:ring-bloom-200',
  ghost: 'bg-transparent text-bloom-700 hover:bg-bloom-100 focus:ring-bloom-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#1faa52] focus:ring-green-300',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
