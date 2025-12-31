"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewEvaluationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [weights, setWeights] = useState({
    clarity: 40,
    specificity: 35,
    safety: 25,
  });
  const [loading, setLoading] = useState(false);

  const availableModels = ["GPT-4.1", "GPT-5.2", "Claude 3.5"];

  const handleModelToggle = (model: string) => {
    setSelectedModels(prev =>
      prev.includes(model)
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (selectedModels.length === 0) {
      alert("Please select at least one model");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          prompt,
          models: selectedModels,
          weights,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create evaluation");
      }

      const { evaluation } = await res.json();

      
      fetch(`/api/evaluations/${evaluation.id}/run`, { method: "POST" })
        .catch(err => console.error("Failed to start evaluation:", err));

      router.push(`/prompt-evaluation/${evaluation.id}`);
    } catch (err) {
      alert("Error creating evaluation");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "32px", maxWidth: "600px" }}>
      <h1>New Prompt Evaluation</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
            Evaluation Name *
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., GPT-4 vs Claude comparison"
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
            Prompt Text *
          </label>
          <textarea
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter the prompt to evaluate..."
            rows={4}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Models to Evaluate Against *
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {availableModels.map((model) => (
              <label key={model} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <input
                  type="checkbox"
                  checked={selectedModels.includes(model)}
                  onChange={() => handleModelToggle(model)}
                />
                {model}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Rubric Weights
          </label>
          <div style={{ display: "grid", gap: "12px" }}>
            {Object.entries(weights).map(([key, value]) => (
              <div key={key}>
                <label style={{ display: "block", marginBottom: "4px", textTransform: "capitalize" }}>
                  {key}: {value}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={value}
                  onChange={(e) => handleWeightChange(key as keyof typeof weights, parseInt(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            ))}
          </div>
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
          {loading ? "Creating..." : "Create Evaluation"}
        </button>
      </form>
    </div>
  );
}
