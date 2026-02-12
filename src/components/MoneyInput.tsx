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
const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, placeholder = "0,00", className, disabled }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow digits, comma, and dot — normalize dots to commas
      let raw = e.target.value.replace(/[^0-9.,]/g, "");
      // Replace dots with commas (user might type either)
      raw = raw.replace(/\./g, ",");
      // Only allow one comma
      const parts = raw.split(",");
      if (parts.length > 2) {
        raw = parts[0] + "," + parts.slice(1).join("");
      }
      // Limit decimal to 2 digits
      if (parts.length === 2 && parts[1].length > 2) {
        raw = parts[0] + "," + parts[1].slice(0, 2);
      }
      onChange(raw);
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
