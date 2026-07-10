import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "dorado" | "rojo" | "verde" | "negro" | "outline";

const VARIANTS: Record<Variant, string> = {
  dorado: "bg-dorado text-negro",
  rojo: "bg-rojo text-crema",
  verde: "bg-verde text-crema",
  negro: "bg-negro text-crema",
  outline: "border border-negro/30 bg-transparent text-negro",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

export function Badge({ variant = "dorado", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
