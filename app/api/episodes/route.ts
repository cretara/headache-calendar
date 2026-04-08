import { and, desc, eq, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { episodes } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const datePattern = /^\d{2}-\d{2}-\d{4}$/;

const episodePayloadSchema = z.object({
  date: z.string().regex(datePattern, "Usa il formato DD-MM-YYYY."),
  intensity: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const episodeFilterSchema = z.object({
  from: z.string().regex(datePattern).optional(),
  to: z.string().regex(datePattern).optional(),
});

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const parsedFilters = episodeFilterSchema.safeParse({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  if (!parsedFilters.success) {
    return NextResponse.json(
      {
        error: "Invalid filters",
        details: parsedFilters.error.issues,
      },
      { status: 400 },
    );
  }

  const { from, to } = parsedFilters.data;

  const data = await db
    .select()
    .from(episodes)
    .where(
      and(
        eq(episodes.userId, userId),
        from ? gte(episodes.date, from) : undefined,
        to ? lte(episodes.date, to) : undefined,
      ),
    )
    .orderBy(desc(episodes.date), desc(episodes.createdAt));

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return unauthorized();
  }

  const json: unknown = await request.json();
  const parsed = episodePayloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid episode payload",
        details: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const [createdEpisode] = await db
    .insert(episodes)
    .values({
      userId,
      date: parsed.data.date,
      intensity: parsed.data.intensity ?? null,
      notes: parsed.data.notes?.trim() ? parsed.data.notes.trim() : null,
    })
    .returning();

  return NextResponse.json(createdEpisode, { status: 201 });
}
