import { getDb } from "@/lib/mongodb"
import { nowMs } from "@/lib/now"
import { notFound } from "next/navigation"

export default async function PastePage({ params }: { params: { id: string } }) {
  const db = await getDb()
  const now = new Date(nowMs())

  const paste = await db.collection("pastes").findOne({
    _id: params.id,
    $and: [
      { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
      { $or: [{ maxViews: null }, { $expr: { $lt: ["$viewCount", "$maxViews"] } }] },
    ],
  })

  if (!paste) notFound()

  return <pre>{paste.content}</pre>
}
