import { getDb } from "@/lib/mongodb"
import { nanoid } from "nanoid"
import { nowMs } from "@/lib/now"

export async function POST(req: Request) {
  const body = await req.json()
  const { content, ttl_seconds, max_views } = body

  if (!content || typeof content !== "string") {
    return Response.json({ error: "Invalid content" }, { status: 400 })
  }

  if (ttl_seconds && ttl_seconds < 1) {
    return Response.json({ error: "Invalid TTL" }, { status: 400 })
  }

  if (max_views && max_views < 1) {
    return Response.json({ error: "Invalid max views" }, { status: 400 })
  }

  const expiresAt = ttl_seconds
    ? new Date(nowMs() + ttl_seconds * 1000)
    : null

  const id = nanoid(8)
  const db = await getDb()

  await db.collection("pastes").insertOne({
    _id: id,
    content,
    expiresAt,
    maxViews: max_views ?? null,
    viewCount: 0,
  })

  return Response.json({
    id,
    url: `/p/${id}`,
  })
}
