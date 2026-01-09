import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { nowMs } from "@/lib/now";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface PastePageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function PastePage({ params }: PastePageProps) {
  const { id } = await params;

  // ✅ Handle invalid MongoDB ObjectId
  if (!ObjectId.isValid(id)) {
    return <PasteNotFound />;
  }

  const db = await getDb();
  const now = new Date(await nowMs());

  const paste = await db.collection("pastes").findOne({
    _id: new ObjectId(id),
    $and: [
      { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
      { $or: [{ maxViews: null }, { $expr: { $lt: ["$views", "$maxViews"] } }] },
    ],
  });

  // ✅ Paste missing / expired / views exceeded
  if (!paste) {
    return <PasteNotFound />;
  }

  // ✅ Increment views only if limited
  if (paste.maxViews !== null && paste.maxViews !== undefined) {
    await db.collection("pastes").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Paste
          </h1>

          <Link
            href="/"
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg"
          >
            + Create Another Paste
          </Link>
        </div>

        {/* Meta info */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {paste.expiresAt
            ? `Expires at: ${new Date(paste.expiresAt).toLocaleString()}`
            : "No expiration"}
          {" • "}
          {paste.maxViews
            ? `Views remaining: ${paste.maxViews - (paste.views || 0)}`
            : "Unlimited views"}
        </div>

        {/* Paste Content */}
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
          <SyntaxHighlighter
            language="text"
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

/* -------------------------------- */
/* Paste Not Found UI */
/* -------------------------------- */

function PasteNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        Paste not found
      </h1>

      <p className="text-gray-500 dark:text-gray-400 mb-6">
        This paste may have expired or the link is invalid.
      </p>

      <Link
        href="/"
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
      >
        Create New Paste
      </Link>
    </div>
  );
}
