import * as React from "react";

import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);

  if (!context) {
    throw new Error("Popover components must be used within <Popover>.");
  }

  return context;
}

function Popover({ children }: Readonly<React.PropsWithChildren>) {
  const [open, setOpen] = React.useState(false);
  const contextValue = React.useMemo(() => ({ open, setOpen }), [open]);

  return (
    <PopoverContext.Provider value={contextValue}>
      <div className="relative">{children}</div>
    </PopoverContext.Provider>
  );
}

function PopoverTrigger({
  children,
  asChild,
}: Readonly<React.PropsWithChildren<{ asChild?: boolean }>>) {
  const { open, setOpen } = usePopoverContext();

  if (asChild) {
    return (
      <button
        type="button"
        className="contents"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {children}
      </button>
    );
  }

  return (
    <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
      {children}
    </button>
  );
}

function PopoverContent({
  className,
  children,
}: Readonly<
  React.PropsWithChildren<{
    className?: string;
    align?: "start" | "center" | "end";
  }>
>) {
  const { open } = usePopoverContext();

  if (!open) return null;

  return (
    <div
      className={cn(
        "bg-popover text-popover-foreground absolute z-50 mt-2 rounded-md border p-3 shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
