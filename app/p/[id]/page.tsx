import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { nowMs } from "@/lib/now";

interface PageProps {
  params: { id: string };
}

export default async function PastePage({ params }: PageProps) {
  const db = await getDb();

  // ✅ Await the async function
  const now = new Date(await nowMs());

  let paste;
  try {
    paste = await db.collection("pastes").findOne({
      _id: new ObjectId(params.id),
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
        { $or: [{ maxViews: null }, { $expr: { $lt: ["$views", "$maxViews"] } }] },
      ],
    });
  } catch {
    return <h1>Paste not found</h1>;
  }

  if (!paste) return <h1>Paste not found</h1>;

  // Increment view count if maxViews is set
  if (paste.maxViews !== null) {
    await db.collection("pastes").updateOne(
      { _id: new ObjectId(params.id) },
      { $inc: { views: 1 } }
    );
  }

  return (
    <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", padding: "1rem" }}>
      {paste.content}
    </div>
  );
}
