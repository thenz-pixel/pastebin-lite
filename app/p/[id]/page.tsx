import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { nowMs } from "@/lib/now";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface PastePageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function PastePage({ params }: PastePageProps) {
  // Unwrap params if it's a Promise
  const { id } = await params;

  const db = await getDb();
  const now = new Date(await nowMs());

  // Find the paste that is not expired and has views remaining
  const paste = await db.collection("pastes").findOne({
    _id: new ObjectId(id),
    $and: [
      { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
      { $or: [{ maxViews: null }, { $expr: { $lt: ["$views", "$maxViews"] } }] },
    ],
  });

  if (!paste) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Paste not found or expired
        </h1>
      </div>
    );
  }

  // Update view count if maxViews is set
  if (paste.maxViews !== null && paste.maxViews !== undefined) {
    await db.collection("pastes").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Paste
        </h1>

        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {paste.expiresAt
            ? `Expires at: ${new Date(paste.expiresAt).toLocaleString()}`
            : "No expiration"}
          {" | "}
          {paste.maxViews
            ? `Views remaining: ${paste.maxViews - (paste.views || 0)}`
            : "Unlimited views"}
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
          <SyntaxHighlighter
            language="javascript"
            style={paste.darkMode ? oneDark : oneLight}
            customStyle={{ margin: 0, padding: "1rem", fontSize: "0.875rem" }}
          >
            {paste.content}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
