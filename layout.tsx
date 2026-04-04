// app/(app)/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain, CalendarDays, List, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background sticky top-0 z-10 border-b">
        <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Brain className="text-primary h-5 w-5" />
              <span className="hidden sm:inline">Headache Tracker</span>
            </Link>
            <nav className="flex gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <CalendarDays className="mr-1.5 h-4 w-4" />
                  Calendar
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/episodes">
                  <List className="mr-1.5 h-4 w-4" />
                  Episodes
                </Link>
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user?.image ?? ""} />
              <AvatarFallback>{session.user?.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
