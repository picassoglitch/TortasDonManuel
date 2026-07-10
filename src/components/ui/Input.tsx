import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-bold uppercase tracking-wide text-negro/70"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "h-12 w-full rounded-xl border-2 bg-white px-4 text-negro placeholder:text-negro/40 focus:outline-none",
          error ? "border-rojo" : "border-negro/15 focus:border-rojo",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm font-semibold text-rojo">{error}</p>}
    </div>
  );
}
