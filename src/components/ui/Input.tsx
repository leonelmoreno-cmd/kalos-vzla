import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

/** Wraps a control with a label, optional hint, and error message. */
export function Field({ label, error, required, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-bloom-600">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function TextInput({ hasError, className = '', ...rest }: TextInputProps) {
  return <input className={`input-base ${hasError ? 'input-error' : ''} ${className}`} {...rest} />;
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function TextArea({ hasError, className = '', ...rest }: TextAreaProps) {
  return (
    <textarea
      className={`input-base resize-none ${hasError ? 'input-error' : ''} ${className}`}
      {...rest}
    />
  );
}
