"use client";

import { Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      onClick={() => {
        startTransition(() => {
          void signOut({ callbackUrl: "/login" });
        });
      }}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      Sign out
    </Button>
  );
}
