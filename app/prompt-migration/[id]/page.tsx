"use client";

import { useEffect, useState, use } from "react";

import { Migration } from "@/types";

export default function MigrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  
  const { id } = use(params);

  const [migration, setMigration] = useState<Migration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/migrations/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setMigration)
      .catch(() => setError("Migration not found"));
  }, [id]);

  
  useEffect(() => {
    if (migration?.status === "RUNNING") {
      const interval = setInterval(() => {
        fetch(`/api/migrations/${id}`)
          .then(async (res) => {
            if (!res.ok) throw new Error("Not found");
            return res.json();
          })
          .then(setMigration)
          .catch(() => setError("Migration not found"));
      }, 1000); 

      return () => clearInterval(interval);
    }
  }, [migration?.status, id]);

  const handleStartMigration = async () => {
    if (!migration || migration.status !== "DRAFT") return;

    setStarting(true);
    try {
      const res = await fetch(`/api/migrations/${id}/start`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to start migration");
      }

      const updatedMigration = await res.json();
      setMigration(updatedMigration.migration);
    } catch (err) {
      alert("Error starting migration");
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const getMigratedPrompt = (originalPrompt: string, targetModel: string) => {
    return `${originalPrompt} (migrated to ${targetModel})`;
  };

  if (error) {
    return (
      <div style={{ padding: "32px" }}>
        <h2>Migration not found</h2>
        <p style={{ opacity: 0.7 }}>
          This can happen during development refresh.
        </p>
      </div>
    );
  }

  if (!migration) {
    return <p style={{ padding: "32px" }}>Loading migration…</p>;
  }

  return (
    <div style={{ padding: "32px" }}>
      <h1>{migration.name}</h1>

      <p>
        <strong>Source Model:</strong> {migration.sourceModel}
      </p>
      <p>
        <strong>Target Model:</strong> {migration.targetModel}
      </p>
      <p>
        <strong>Status:</strong> {migration.status}
      </p>

      {migration.status === "DRAFT" && (
        <button
          onClick={handleStartMigration}
          disabled={starting}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: starting ? "not-allowed" : "pointer",
            marginBottom: "16px",
          }}
        >
          {starting ? "Starting..." : "Start Migration"}
        </button>
      )}

      <h3>Original Prompts</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {migration.prompts.map((p, i) => (
          <li key={i} style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{p.source}</span>
              <button
                onClick={() => copyToClipboard(p.source)}
                style={{
                  padding: "4px 8px",
                  fontSize: "12px",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Copy
              </button>
            </div>
          </li>
        ))}
      </ul>

      {migration.status !== "DRAFT" && (
        <>
          <h3>Migrated Prompts</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {migration.prompts.map((p, i) => (
              <li key={i} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{p.migrated || getMigratedPrompt(p.source, migration.targetModel)}</span>
                  <button
                    onClick={() => copyToClipboard(p.migrated || getMigratedPrompt(p.source, migration.targetModel))}
                    style={{
                      padding: "4px 8px",
                      fontSize: "12px",
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #dee2e6",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Copy
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
