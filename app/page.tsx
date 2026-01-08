"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // ✅ SAFE submit handler (prevents JSON parse errors)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResultUrl("");
    setLoading(true);

    const body: any = { content };
    if (ttl) body.ttl_seconds = Number(ttl);
    if (maxViews) body.max_views = Number(maxViews);

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // 🔐 Safe response handling
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create paste");
      }

      setResultUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-slate-900" : "bg-gray-50"
      } py-12 px-4`}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Pastebin<span className="text-indigo-500">Lite</span>
            </h1>
            <p className={darkMode ? "text-slate-400" : "text-slate-600"}>
              Secure, ephemeral text sharing.
            </p>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full border ${
              darkMode
                ? "bg-slate-800 border-slate-700 text-yellow-400"
                : "bg-white border-gray-200 text-slate-600 shadow-sm"
            }`}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Result */}
        {resultUrl && (
          <div className="mb-8">
            <div
              className={`p-6 rounded-2xl border ${
                darkMode
                  ? "bg-slate-800 border-indigo-500/30"
                  : "bg-white border-green-200 shadow-lg"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <span
                  className={`text-sm font-bold uppercase ${
                    darkMode ? "text-indigo-400" : "text-green-600"
                  }`}
                >
                  Paste Ready
                </span>

                <button
                  onClick={() => navigator.clipboard.writeText(resultUrl)}
                  className="text-xs px-3 py-1 bg-indigo-500 text-white rounded-full"
                >
                  Copy Link
                </button>
              </div>

              <input
                readOnly
                value={resultUrl}
                className={`w-full p-3 rounded-lg mb-4 text-sm font-mono border ${
                  darkMode
                    ? "bg-slate-900 border-slate-700 text-indigo-300"
                    : "bg-gray-50 border-gray-200"
                }`}
              />

              <p className="text-xs mb-2 opacity-60">PREVIEW:</p>
              <SyntaxHighlighter
                language="text"
                style={darkMode ? oneDark : oneLight}
                customStyle={{ margin: 0, padding: "1rem", fontSize: "0.875rem" }}
              >
                {content || "// Your content will appear here"}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {/* Form */}
        {!resultUrl && (
          <form
            onSubmit={handleSubmit}
            className={`p-8 rounded-2xl shadow-xl border ${
              darkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-100"
            }`}
          >
            <textarea
              placeholder="Paste your content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className={`w-full p-5 mb-6 min-h-[300px] rounded-xl font-mono text-sm border ${
                darkMode
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-gray-50 border-gray-200"
              }`}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <input
                type="number"
                placeholder="TTL (seconds)"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                className="p-3 rounded-lg border"
              />
              <input
                type="number"
                placeholder="Max views"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                className="p-3 rounded-lg border"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? "Creating..." : "Generate Secure Link"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-center text-red-500 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}
