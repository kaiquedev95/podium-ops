import * as React from "react";
import { cn } from "@/lib/utils";

interface MoneyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Brazilian money input — accepts comma as decimal separator.
 * Stores raw string like "1500,50" and exposes toNumber() helper.
 * Parent stores string; convert with parseBRL when saving.
 */
const formatBRL = (raw: string): string => {
  // Strip everything except digits and comma
  let clean = raw.replace(/[^0-9,]/g, "");
  // Only one comma allowed
  const parts = clean.split(",");
  if (parts.length > 2) {
    clean = parts[0] + "," + parts.slice(1).join("");
  }
  // Limit decimal part to 2 digits
  let intPart = parts[0];
  const decPart = parts.length >= 2 ? parts[1].slice(0, 2) : undefined;
  // Add thousand separators (dots) to integer part
  intPart = intPart.replace(/^0+(?=\d)/, ""); // remove leading zeros
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decPart !== undefined ? `${intPart},${decPart}` : intPart;
};

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, placeholder = "0,00", className, disabled }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      // Normalize dots typed as decimal to comma (if user types dot after digits with no existing comma)
      let normalized = input;
      // If user typed a dot and there's no comma yet, treat it as decimal separator
      if (normalized.includes(".") && !normalized.includes(",")) {
        // Check if it's a single trailing dot (user just pressed dot for decimal)
        const dotCount = (normalized.match(/\./g) || []).length;
        if (dotCount === 1 && normalized.endsWith(".")) {
          normalized = normalized.replace(".", ",");
        }
      }
      // Remove thousand-separator dots (keep only digits and comma)
      const formatted = formatBRL(normalized);
      onChange(formatted);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    );
  }
);
MoneyInput.displayName = "MoneyInput";

/** Convert "1.500,50" or "1500,50" to number 1500.5 */
export const parseBRL = (val: string): number => {
  if (!val) return 0;
  // Remove thousand separators (dots before comma) then replace comma with dot
  const cleaned = val.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

export { MoneyInput };
