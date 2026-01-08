import { getDb } from "@/lib/mongodb"
import { nowMs } from "@/lib/now"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const db = await getDb()
  const now = new Date(nowMs())

  const paste = await db.collection("pastes").findOneAndUpdate(
    {
      _id: params.id,
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
        { $or: [{ maxViews: null }, { $expr: { $lt: ["$viewCount", "$maxViews"] } }] },
      ],
    },
    { $inc: { viewCount: 1 } },
    { returnDocument: "after" }
  )

  if (!paste.value) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  return Response.json({
    content: paste.value.content,
    remaining_views:
      paste.value.maxViews === null
        ? null
        : paste.value.maxViews - paste.value.viewCount,
    expires_at: paste.value.expiresAt?.toISOString() ?? null,
  })
}
