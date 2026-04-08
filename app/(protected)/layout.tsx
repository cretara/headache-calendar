import Link from "next/link";
import { Brain, FilePenLine, List } from "lucide-react";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

const navigation = [
  { href: "/list", label: "List", icon: List },
  { href: "/edit", label: "Edit", icon: FilePenLine },
];

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const displayName = session.user.name ?? session.user.email ?? "Authenticated user";

  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-2">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Headache Calendar</p>
              <p className="text-muted-foreground text-sm">Signed in as {displayName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Button key={href} variant="ghost" asChild>
                <Link href={href}>
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </Button>
            ))}
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
