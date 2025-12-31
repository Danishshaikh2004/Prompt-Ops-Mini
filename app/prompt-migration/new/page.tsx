"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMigrationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [sourceModel, setSourceModel] = useState("");
  const [targetModel, setTargetModel] = useState("");
  const [notes, setNotes] = useState("");
  const [promptsText, setPromptsText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    
    if (sourceModel === targetModel) {
      alert("Target model cannot be the same as source model");
      setLoading(false);
      return;
    }

    try {
      const prompts = promptsText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const res = await fetch("/api/migrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sourceModel,
          targetModel,
          notes,
          prompts,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create migration");
      }

      const migration = await res.json();

    
      router.push(`/prompt-migration/${migration.id}`);
    } catch (err) {
      alert("Error creating migration");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "32px", maxWidth: "600px" }}>
      <h1>New Prompt Migration</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
            Migration Name *
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="GPT-3 → GPT-4 prompts"
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
            Source Model *
          </label>
          <select
            required
            value={sourceModel}
            onChange={(e) => setSourceModel(e.target.value)}
            aria-label="Source model"
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            <option value="">Select source model</option>
            <option value="gpt-3.5">GPT-3.5</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-3">Claude-3</option>
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
            Target Model *
          </label>
          <select
            required
            value={targetModel}
            onChange={(e) => setTargetModel(e.target.value)}
            aria-label="Target model"
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            <option value="">Select target model</option>
            <option value="gpt-3.5">GPT-3.5</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-3">Claude-3</option>
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes about this migration..."
            rows={3}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
            Prompts to Migrate *
          </label>
          <textarea
            required
            value={promptsText}
            onChange={(e) => setPromptsText(e.target.value)}
            placeholder="Enter one prompt per line..."
            rows={6}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating..." : "Create Migration"}
        </button>
      </form>
    </div>
  );
}
