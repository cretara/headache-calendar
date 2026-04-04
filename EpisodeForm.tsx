"use client";
// components/episodes/EpisodeForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Episode } from "@/drizzle/schema";

const schema = z.object({
  date: z.date({ required_error: "Date is required" }),
  intensity: z.number().min(1).max(10).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface EpisodeFormProps {
  episode?: Episode;
  onSuccess?: (episode: Episode) => void;
  onCancel?: () => void;
}

const INTENSITY_LABELS: Record<number, string> = {
  1: "Very mild", 2: "Mild", 3: "Mild+", 4: "Moderate",
  5: "Moderate+", 6: "Strong", 7: "Strong+", 8: "Severe",
  9: "Very severe", 10: "Unbearable",
};

const intensityColor = (v: number) => {
  if (v <= 3) return "text-emerald-600";
  if (v <= 6) return "text-amber-500";
  return "text-red-600";
};

export function EpisodeForm({ episode, onSuccess, onCancel }: EpisodeFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: episode?.date ? new Date(episode.date) : new Date(),
      intensity: episode?.intensity ?? null,
      notes: episode?.notes ?? "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const intensityVal = form.watch("intensity");

  async function onSubmit(values: FormValues) {
    const payload = {
      date: format(values.date, "yyyy-MM-dd"),
      intensity: values.intensity ?? null,
      notes: values.notes || null,
    };

    const url = episode ? `/api/episodes/${episode.id}` : "/api/episodes";
    const method = episode ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data: Episode = await res.json();
      onSuccess?.(data);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Date */}
        <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange}
                  disabled={(date) => date > new Date()} initialFocus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />

        {/* Intensity */}
        <FormField control={form.control} name="intensity" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Intensity{" "}
              {intensityVal != null && (
                <span className={cn("font-semibold ml-1", intensityColor(intensityVal))}>
                  {intensityVal} – {INTENSITY_LABELS[intensityVal]}
                </span>
              )}
            </FormLabel>
            <FormControl>
              <div className="pt-2 px-1">
                <Slider
                  min={1} max={10} step={1}
                  value={field.value != null ? [field.value] : [5]}
                  onValueChange={([v]) => field.onChange(v)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 – Mild</span>
                  <span>10 – Unbearable</span>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Notes */}
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="Triggers, medication taken, duration…"
                className="resize-none h-28" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex gap-2 justify-end">
          {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {episode ? "Save changes" : "Log episode"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
