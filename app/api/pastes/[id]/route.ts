import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest, context: { params: any }) {
  const { id } = context.params;

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch (err) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const db = await getDb();

  let now = new Date();
  if (process.env.TEST_MODE === "1") {
    const testNowMs = request.headers.get("x-test-now-ms");
    if (testNowMs) now = new Date(Number(testNowMs));
  }

  const paste = await db.collection("pastes").findOne({
    _id: objectId,
    $and: [
      { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
      { $or: [{ maxViews: null }, { $expr: { $lt: ["$views", "$maxViews"] } }] },
    ],
  });

  if (!paste) {
    return NextResponse.json({ error: "Paste not found or unavailable" }, { status: 404 });
  }

  if (paste.maxViews !== null) {
    await db.collection("pastes").updateOne({ _id: objectId }, { $inc: { views: 1 } });
  }

  return NextResponse.json({
    content: paste.content,
    remaining_views: paste.maxViews !== null ? paste.maxViews - (paste.views + 1) : null,
    expires_at: paste.expiresAt,
  });
}
