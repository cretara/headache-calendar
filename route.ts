// app/api/episodes/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { episodes } from "@/drizzle/schema";
import { and, between, eq, ilike, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  intensity: z.number().int().min(1).max(10).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

// GET /api/episodes?from=&to=&minIntensity=&maxIntensity=&q=
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const minIntensity = searchParams.get("minIntensity");
  const maxIntensity = searchParams.get("maxIntensity");
  const q = searchParams.get("q");

  const conditions = [eq(episodes.userId, session.user.id)];

  if (from && to) conditions.push(between(episodes.date, from, to));
  else if (from) conditions.push(gte(episodes.date, from));
  else if (to) conditions.push(lte(episodes.date, to));

  if (minIntensity) conditions.push(gte(episodes.intensity, parseInt(minIntensity)));
  if (maxIntensity) conditions.push(lte(episodes.intensity, parseInt(maxIntensity)));
  if (q) conditions.push(ilike(episodes.notes, `%${q}%`));

  const rows = await db
    .select()
    .from(episodes)
    .where(and(...conditions))
    .orderBy(episodes.date);

  return NextResponse.json(rows);
}

// POST /api/episodes
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [row] = await db
    .insert(episodes)
    .values({ ...parsed.data, userId: session.user.id })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
