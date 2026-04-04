"use client";
// components/calendar/HeadacheCalendar.tsx
import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         getDay, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Episode } from "@/drizzle/schema";

interface HeadacheCalendarProps {
  onDaySelect?: (date: Date, episodes: Episode[]) => void;
}

const intensityBg = (intensity: number | null | undefined) => {
  if (!intensity) return "bg-slate-300";
  if (intensity <= 3) return "bg-emerald-400";
  if (intensity <= 6) return "bg-amber-400";
  return "bg-red-500";
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HeadacheCalendar({ onDaySelect }: HeadacheCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEpisodes = useCallback(async (month: Date) => {
    setLoading(true);
    const from = format(startOfMonth(month), "yyyy-MM-dd");
    const to = format(endOfMonth(month), "yyyy-MM-dd");
    const res = await fetch(`/api/episodes?from=${from}&to=${to}`);
    const data: Episode[] = await res.json();
    setEpisodes(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEpisodes(currentMonth); }, [currentMonth, fetchEpisodes]);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOffset = getDay(days[0]);

  const episodesForDay = (day: Date) =>
    episodes.filter((e) => isSameDay(new Date(e.date + "T00:00:00"), day));

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    onDaySelect?.(day, episodesForDay(day));
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-semibold text-lg">
          {format(currentMonth, "MMMM yyyy")}
          {loading && <span className="ml-2 text-sm text-muted-foreground">Loading…</span>}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const dayEpisodes = episodesForDay(day);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative flex flex-col items-center justify-start rounded-lg p-1 pt-1.5 min-h-[3.5rem]",
                "hover:bg-muted transition-colors text-sm",
                isSelected && "ring-2 ring-primary bg-muted",
                isToday(day) && "font-bold"
              )}
            >
              <span className={cn(
                "w-6 h-6 flex items-center justify-center rounded-full text-xs",
                isToday(day) && "bg-primary text-primary-foreground"
              )}>
                {format(day, "d")}
              </span>

              {/* Intensity dots */}
              <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                {dayEpisodes.slice(0, 3).map((ep) => (
                  <span
                    key={ep.id}
                    className={cn("w-1.5 h-1.5 rounded-full", intensityBg(ep.intensity))}
                  />
                ))}
                {dayEpisodes.length > 3 && (
                  <span className="text-[9px] text-muted-foreground">+{dayEpisodes.length - 3}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
        {[
          { label: "Mild (1–3)", cls: "bg-emerald-400" },
          { label: "Moderate (4–6)", cls: "bg-amber-400" },
          { label: "Severe (7–10)", cls: "bg-red-500" },
          { label: "No rating", cls: "bg-slate-300" },
        ].map(({ label, cls }) => (
          <span key={label} className="flex items-center gap-1">
            <span className={cn("w-2.5 h-2.5 rounded-full inline-block", cls)} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
