import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { CalendarDays, FilePenLine } from "lucide-react";
import { format } from "date-fns";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { episodes } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const formatEpisodeDate = (value: string) =>
  format(new Date(`${value}T00:00:00`), "PPP");

const getIntensityText = (intensity: number | null) =>
  intensity === null ? "No rating" : `Intensity ${intensity}/10`;

export default async function EpisodeListPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userEpisodes = await db
    .select()
    .from(episodes)
    .where(eq(episodes.userId, session.user.id))
    .orderBy(desc(episodes.date), desc(episodes.createdAt));

  const episodeCountLabel = `${userEpisodes.length} episode${userEpisodes.length === 1 ? "" : "s"} found.`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Episode list</h1>
          <p className="text-muted-foreground">
            Review every headache episode saved in your account.
          </p>
        </div>

        <Button asChild>
          <Link href="/edit">
            <FilePenLine className="h-4 w-4" />
            Manage episodes
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved entries</CardTitle>
          <CardDescription>
            {userEpisodes.length === 0
              ? "No episodes have been logged yet."
              : episodeCountLabel}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {userEpisodes.length === 0 ? (
            <div className="border-muted-foreground/20 text-muted-foreground rounded-3xl border border-dashed px-4 py-8 text-center">
              Start tracking from the edit page to see your history here.
            </div>
          ) : (
            userEpisodes.map((episode) => (
              <div
                key={episode.id}
                className="flex flex-col gap-3 rounded-3xl border p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">
                      {formatEpisodeDate(episode.date)}
                    </span>
                    <Badge variant="secondary">
                      {getIntensityText(episode.intensity)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {episode.notes?.trim() || "No notes provided for this episode."}
                  </p>
                </div>

                <Button variant="outline" asChild>
                  <Link href="/edit">Edit</Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
