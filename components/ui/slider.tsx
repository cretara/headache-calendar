import * as React from "react";

import { cn } from "@/lib/utils";

type SliderProps = Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  value?: number[];
  onValueChange?: (value: number[]) => void;
};

function Slider({
  className,
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0] ?? min}
      onChange={(event) => onValueChange?.([Number(event.target.value)])}
      className={cn("accent-primary w-full", className)}
      {...props}
    />
  );
}

export { Slider };
