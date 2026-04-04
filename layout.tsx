// app/(app)/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain, CalendarDays, List, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Brain className="h-5 w-5 text-primary" />
              <span className="hidden sm:inline">Headache Tracker</span>
            </Link>
            <nav className="flex gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/"><CalendarDays className="h-4 w-4 mr-1.5" />Calendar</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/episodes"><List className="h-4 w-4 mr-1.5" />Episodes</Link>
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user?.image ?? ""} />
              <AvatarFallback>{session.user?.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
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
