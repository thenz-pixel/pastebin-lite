import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface PageProps {
  params: { id: string };
}

export default async function PastePage({ params }: PageProps) {
  const { id } = params;
  let paste;

  try {
    const db = await getDb();
    paste = await db.collection("pastes").findOne({ _id: new ObjectId(id) });
  } catch {
    return <h1>Paste not found</h1>;
  }

  if (!paste) return <h1>Paste not found</h1>;

  // Render content safely
  return (
    <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", padding: "1rem" }}>
      {paste.content}
    </div>
  );
}
