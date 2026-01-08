import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb"; // make sure getDb returns the connected db

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { content, ttl_seconds, max_views } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required and must be a string" }, { status: 400 });
    }

    if (ttl_seconds && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
      return NextResponse.json({ error: "ttl_seconds must be an integer ≥ 1" }, { status: 400 });
    }

    if (max_views && (!Number.isInteger(max_views) || max_views < 1)) {
      return NextResponse.json({ error: "max_views must be an integer ≥ 1" }, { status: 400 });
    }

    const db = await getDb();

    // Calculate expiry date if ttl_seconds is provided
    const expiresAt = ttl_seconds ? new Date(Date.now() + ttl_seconds * 1000) : null;

    // Insert into MongoDB
    const result = await db.collection("pastes").insertOne({
      content,
      expiresAt,
      maxViews: max_views ?? null,
      viewCount: 0,
      createdAt: new Date(),
    });

    // Generate URL using Vercel env var
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not set in environment variables");
    }

    const url = `${baseUrl}/p/${result.insertedId}`;

    return NextResponse.json({ id: result.insertedId, url }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/pastes error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
