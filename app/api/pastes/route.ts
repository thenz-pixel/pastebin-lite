import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, ttl_seconds, max_views } = body;

  if (!content || typeof content !== "string" || content.trim() === "") {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  if (ttl_seconds && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
    return NextResponse.json({ error: "ttl_seconds must be >= 1" }, { status: 400 });
  }

  if (max_views && (!Number.isInteger(max_views) || max_views < 1)) {
    return NextResponse.json({ error: "max_views must be >= 1" }, { status: 400 });
  }

  const db = await getDb();

  const now = new Date();
  const expiresAt = ttl_seconds ? new Date(now.getTime() + ttl_seconds * 1000) : null;

  const result = await db.collection("pastes").insertOne({
    content,
    createdAt: now,
    expiresAt,
    maxViews: max_views ?? null,
    views: 0,
  });

  return NextResponse.json({
    id: result.insertedId.toString(),
    url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/p/${result.insertedId}`,
  });
}
