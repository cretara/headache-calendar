import * as React from "react";

import { cn } from "@/lib/utils";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error("DropdownMenu components must be used within <DropdownMenu>.");
  }

  return context;
}

function DropdownMenu({ children }: React.PropsWithChildren) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({
  children,
  asChild,
}: React.PropsWithChildren<{ asChild?: boolean }>) {
  const { open, setOpen } = useDropdownMenuContext();

  if (asChild) {
    return (
      <span className="contents" onClick={() => setOpen(!open)}>
        {children}
      </span>
    );
  }

  return (
    <button type="button" onClick={() => setOpen(!open)}>
      {children}
    </button>
  );
}

function DropdownMenuContent({
  className,
  children,
}: React.PropsWithChildren<{ className?: string; align?: "start" | "center" | "end" }>) {
  const { open } = useDropdownMenuContext();

  if (!open) return null;

  return (
    <div
      className={cn(
        "bg-popover text-popover-foreground absolute right-0 z-50 mt-2 min-w-40 rounded-md border p-1 shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { setOpen } = useDropdownMenuContext();

  return (
    <button
      type="button"
      className={cn(
        "hover:bg-muted flex w-full rounded-sm px-2 py-1.5 text-left text-sm",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
};
