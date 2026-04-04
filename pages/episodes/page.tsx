"use client";
// app/(app)/episodes/page.tsx
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Search, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportButtons } from "@/components/export/ExportButtons";
import type { Episode } from "@/drizzle/schema";
import { cn } from "@/lib/utils";

const intensityColor = (v: number | null | undefined) => {
  if (!v) return "text-slate-500";
  if (v <= 3) return "text-emerald-600";
  if (v <= 6) return "text-amber-600";
  return "text-red-600";
};

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [intensityRange, setIntensityRange] = useState<[number, number]>([
    1, 10,
  ]);

  const fetchEpisodes = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("minIntensity", String(intensityRange[0]));
    params.set("maxIntensity", String(intensityRange[1]));

    const res = await fetch(`/api/episodes?${params}`);
    const data: Episode[] = await res.json();
    setEpisodes(data);
    setLoading(false);
  }, [q, from, to, intensityRange]);

  useEffect(() => {
    void fetchEpisodes();
  }, [fetchEpisodes]);

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Episodes</h1>
        <ExportButtons episodes={episodes} />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label>Search notes</Label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Search…"
                className="pl-8"
                value={q}
                onChange={(e) => {
                  setLoading(true);
                  setQ(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>From</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => {
                setLoading(true);
                setFrom(e.target.value);
              }}
            />
          </div>

          <div className="space-y-1">
            <Label>To</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => {
                setLoading(true);
                setTo(e.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Intensity: {intensityRange[0]}–{intensityRange[1]}
            </Label>
            <Slider
              min={1}
              max={10}
              step={1}
              value={intensityRange}
              onValueChange={(v) => {
                setLoading(true);
                setIntensityRange(v as [number, number]);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : episodes.length === 0 ? (
        <p className="text-muted-foreground text-sm">No episodes found.</p>
      ) : (
        <div className="space-y-2">
          {episodes.map((ep) => (
            <Card key={ep.id}>
              <CardContent className="flex items-start gap-4 px-4 py-3">
                <div className="text-muted-foreground flex min-w-[100px] items-center gap-1.5 text-sm">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {format(new Date(ep.date + "T00:00:00"), "dd MMM yyyy")}
                </div>

                {ep.intensity != null ? (
                  <Badge
                    variant="outline"
                    className={cn("shrink-0", intensityColor(ep.intensity))}
                  >
                    {ep.intensity}/10
                  </Badge>
                ) : (
                  <span className="text-muted-foreground shrink-0 text-xs">
                    No rating
                  </span>
                )}

                <p className="text-muted-foreground line-clamp-2 flex-1 text-sm">
                  {ep.notes || <em>No notes</em>}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
