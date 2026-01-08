import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDb()
    await db.command({ ping: 1 })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}
