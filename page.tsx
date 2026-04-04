// app/(app)/page.tsx
"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Plus, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeadacheCalendar } from "@/components/calendar/HeadacheCalendar";
import { EpisodeForm } from "@/components/episodes/EpisodeForm";
import type { Episode } from "@/drizzle/schema";
import { cn } from "@/lib/utils";

const intensityColor = (v: number | null | undefined) => {
  if (!v) return "";
  if (v <= 3) return "border-emerald-400 text-emerald-700";
  if (v <= 6) return "border-amber-400 text-amber-700";
  return "";
};

export default function HomePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEpisode, setEditEpisode] = useState<Episode | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEpisodes, setSelectedEpisodes] = useState<Episode[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDaySelect = (date: Date, eps: Episode[]) => {
    setSelectedDate(date);
    setSelectedEpisodes(eps);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditEpisode(null);
    setRefreshKey((k) => k + 1); // trigger calendar refetch
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this episode?")) return;
    await fetch(`/api/episodes/${id}`, { method: "DELETE" });
    setSelectedEpisodes((eps) => eps.filter((e) => e.id !== id));
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="container mx-auto max-w-5xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="text-primary h-6 w-6" />
          <h1 className="text-2xl font-bold">Headache Tracker</h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditEpisode(null)}>
              <Plus className="mr-2 h-4 w-4" /> Log episode
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editEpisode ? "Edit episode" : "New episode"}
              </DialogTitle>
            </DialogHeader>
            <EpisodeForm
              episode={editEpisode ?? undefined}
              onSuccess={handleSuccess}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <HeadacheCalendar key={refreshKey} onDaySelect={handleDaySelect} />
          </CardContent>
        </Card>

        {/* Day detail panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDate
                ? format(selectedDate, "MMMM d, yyyy")
                : "Select a day"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEpisodes.length === 0 && (
              <p className="text-muted-foreground text-sm">
                {selectedDate
                  ? "No episodes on this day."
                  : "Click a day on the calendar."}
              </p>
            )}

            <div className="space-y-3">
              {selectedEpisodes.map((ep) => (
                <div
                  key={ep.id}
                  className="space-y-1 rounded-lg border p-3 text-sm"
                >
                  {ep.intensity != null && (
                    <Badge
                      variant="outline"
                      className={cn("mb-1", intensityColor(ep.intensity))}
                    >
                      Intensity {ep.intensity}/10
                    </Badge>
                  )}
                  {ep.notes && (
                    <p className="text-muted-foreground">{ep.notes}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        setEditEpisode(ep);
                        setDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive h-7 text-xs"
                      onClick={() => handleDelete(ep.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {selectedDate && (
              <Button
                size="sm"
                variant="outline"
                className="mt-4 w-full"
                onClick={() => {
                  setEditEpisode(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="mr-1 h-3 w-3" /> Add episode on this day
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
