// app/api/episodes/[id]/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { episodes } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  intensity: z.number().int().min(1).max(10).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

// PUT /api/episodes/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const [row] = await db
    .update(episodes)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(
      and(eq(episodes.id, params.id), eq(episodes.userId, session.user.id)),
    )
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

// DELETE /api/episodes/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [row] = await db
    .delete(episodes)
    .where(
      and(eq(episodes.id, params.id), eq(episodes.userId, session.user.id)),
    )
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
