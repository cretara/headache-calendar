import * as React from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";

type CalendarProps = {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  mode?: "single";
  initialFocus?: boolean;
  className?: string;
};

function Calendar({ selected, onSelect, className }: CalendarProps) {
  return (
    <input
      type="date"
      value={selected ? format(selected, "yyyy-MM-dd") : ""}
      max={format(new Date(), "yyyy-MM-dd")}
      onChange={(event) => {
        const value = event.target.value;
        onSelect?.(value ? new Date(`${value}T00:00:00`) : undefined);
      }}
      className={cn(
        "border-input bg-background rounded-md border px-3 py-2 text-sm",
        className,
      )}
    />
  );
}

export { Calendar };
