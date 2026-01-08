"use client"

import { useState } from "react"

export default function HomePage() {
  const [content, setContent] = useState("")
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResultUrl(null)

    const res = await fetch("/api/pastes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Something went wrong")
      return
    }

    const data = await res.json()
    setResultUrl(data.url)
  }

  return (
    <main style={{ padding: "20px", maxWidth: "600px" }}>
      <h1>Create a Paste</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Paste your text here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <button type="submit">Create Paste</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {resultUrl && (
        <p>
          Paste created:{" "}
          <a href={resultUrl} target="_blank">
            {resultUrl}
          </a>
        </p>
      )}
    </main>
  )
}
