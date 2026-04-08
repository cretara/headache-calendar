import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { episodes } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const episodePayloadSchema = z.object({
  date: z.string().regex(datePattern, "Use YYYY-MM-DD format."),
  intensity: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;

  const [updatedEpisode] = await db
    .update(episodes)
    .set({
      date: parsed.data.date,
      intensity: parsed.data.intensity ?? null,
      notes: parsed.data.notes?.trim() ? parsed.data.notes.trim() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(episodes.id, id), eq(episodes.userId, userId)))
    .returning();

  if (!updatedEpisode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  return NextResponse.json(updatedEpisode);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return unauthorized();
  }

  const { id } = await params;

  const [deletedEpisode] = await db
    .delete(episodes)
    .where(and(eq(episodes.id, id), eq(episodes.userId, userId)))
    .returning();

  if (!deletedEpisode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
