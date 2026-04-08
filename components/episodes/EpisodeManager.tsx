"use client";

import { format } from "date-fns";
import { Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { HeadacheCalendar } from "@/components/calendar/HeadacheCalendar";
import { EpisodeForm } from "@/components/episodes/EpisodeForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Episode } from "@/drizzle/schema";

const formatEpisodeDate = (value: string) =>
  format(new Date(`${value}T00:00:00`), "PPP");

const getIntensityText = (intensity: number | null) =>
  intensity === null ? "No rating" : `Intensity ${intensity}/10`;

export function EpisodeManager() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayEpisodes, setSelectedDayEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEpisodes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/episodes", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load episodes.");
      }

      const data: Episode[] = await response.json();
      setEpisodes(data);
    } catch {
      setError("Unable to load your episodes right now.");
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEpisodes();
  }, [loadEpisodes]);

  const handleDelete = async (episode: Episode) => {
    const confirmed = globalThis.confirm(
      `Delete the episode from ${formatEpisodeDate(episode.date)}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(episode.id);
    setError(null);

    try {
      const response = await fetch(`/api/episodes/${episode.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      if (selectedEpisode?.id === episode.id) {
        setSelectedEpisode(undefined);
      }

      await loadEpisodes();
    } catch {
      setError("Unable to delete the selected episode.");
    } finally {
      setDeletingId(null);
    }
  };

  const episodeCountLabel = `${episodes.length} saved episode${episodes.length === 1 ? "" : "s"}`;

  const renderDayDetails = () => {
    if (selectedDate === null) {
      return (
        <p className="text-muted-foreground text-sm">
          No day selected yet.
        </p>
      );
    }

    if (selectedDayEpisodes.length === 0) {
      return (
        <p className="text-muted-foreground text-sm">
          No episodes recorded for this day.
        </p>
      );
    }

    return selectedDayEpisodes.map((episode) => (
      <div
        key={episode.id}
        className="flex items-center justify-between gap-3 rounded-3xl border p-3"
      >
        <div>
          <p className="font-medium">{getIntensityText(episode.intensity)}</p>
          <p className="text-muted-foreground text-sm">
            {episode.notes?.trim() || "No notes provided."}
          </p>
        </div>
        <Button variant="outline" onClick={() => setSelectedEpisode(episode)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>
    ));
  };

  const renderEpisodeList = () => {
    if (loading) {
      return (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading episodes...
        </div>
      );
    }

    if (episodes.length === 0) {
      return (
        <p className="text-muted-foreground text-sm">
          No episodes yet. Add your first one with the form above.
        </p>
      );
    }

    return episodes.map((episode) => (
      <div key={episode.id} className="rounded-3xl border p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="font-medium">{formatEpisodeDate(episode.date)}</p>
          <Badge variant="secondary">{getIntensityText(episode.intensity)}</Badge>
        </div>

        <p className="text-muted-foreground mb-3 text-sm">
          {episode.notes?.trim() || "No notes provided for this episode."}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setSelectedEpisode(episode)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleDelete(episode)}
            disabled={deletingId === episode.id}
          >
            {deletingId === episode.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar view</CardTitle>
            <CardDescription>
              Select a day to inspect the episodes recorded on it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HeadacheCalendar
              onDaySelect={(date, dayEpisodes) => {
                setSelectedDate(date);
                setSelectedDayEpisodes(dayEpisodes);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? `Entries for ${format(selectedDate, "PPP")}`
                : "Day details"}
            </CardTitle>
            <CardDescription>
              {selectedDate
                ? "Choose an entry below to edit it."
                : "Pick a day in the calendar to inspect its entries."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">{renderDayDetails()}</CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  {selectedEpisode ? "Update episode" : "Log a new episode"}
                </CardTitle>
                <CardDescription>
                  Use the form to create or edit an episode entry.
                </CardDescription>
              </div>
              {selectedEpisode && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedEpisode(undefined)}
                >
                  <PlusCircle className="h-4 w-4" />
                  New entry
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <EpisodeForm
              episode={selectedEpisode}
              onCancel={() => setSelectedEpisode(undefined)}
              onSuccess={() => {
                setSelectedEpisode(undefined);
                void loadEpisodes();
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All episodes</CardTitle>
            <CardDescription>
              {loading ? "Loading your latest entries..." : episodeCountLabel}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            {renderEpisodeList()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
