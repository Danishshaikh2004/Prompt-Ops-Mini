"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Evaluation } from "@/types";

export default function PromptEvaluationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchEvaluation = () => {
      fetch(`/api/evaluations/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch evaluation");
          return res.json();
        })
        .then(setEvaluation)
        .catch((error) => {
          console.error("Failed to fetch evaluation:", error);
          setEvaluation(null);
        })
        .finally(() => setLoading(false));
    };

    
    fetchEvaluation();

    const interval = setInterval(() => {
      if (evaluation?.status === "RUNNING") {
        fetchEvaluation();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, evaluation?.status]);

  const handleExport = () => {
    if (!evaluation) return;

    const dataStr = JSON.stringify(evaluation, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `evaluation-${evaluation.id}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        <div style={{
          display: "inline-block",
          width: "40px",
          height: "40px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #8b5cf6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ marginTop: "16px", color: "#6c757d" }}>Loading evaluation...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        <div style={{
          fontSize: "64px",
          color: "#dee2e6",
          marginBottom: "16px"
        }}>📊</div>
        <h2 style={{ color: "#6c757d", marginBottom: "8px" }}>Evaluation not found</h2>
        <p style={{ color: "#adb5bd" }}>
          This evaluation may not exist or there was an error loading it.
        </p>
      </div>
    );
  }

  const getBestOverallScore = () => {
    if (!evaluation.results) return null;
    return evaluation.results.reduce((best, current) =>
      current.overall > best.overall ? current : best
    );
  };

  const bestResult = getBestOverallScore();

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1>{evaluation.name}</h1>
        <button
          onClick={handleExport}
          style={{
            padding: "8px 16px",
            backgroundColor: "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Export JSON
        </button>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "12px", color: "#495057" }}>📝 Prompt</h3>
        <div style={{
          color: "black",
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e9ecef",
          fontFamily: "monospace",
          fontSize: "14px",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word"
        }}>
          {evaluation.prompt}
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px", color: "#495057" }}>⚖️ Rubric Weights</h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px"
        }}>
          <div style={{
            backgroundColor: "#e3f2fd",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
            border: "1px solid #bbdefb"
          }}>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1976d2" }}>
              {evaluation.weights.clarity}
            </div>
            <div style={{ fontSize: "14px", color: "#424242", marginTop: "4px" }}>Clarity</div>
          </div>
          <div style={{
            backgroundColor: "#f3e5f5",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
            border: "1px solid #ce93d8"
          }}>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#7b1fa2" }}>
              {evaluation.weights.specificity}
            </div>
            <div style={{ fontSize: "14px", color: "#424242", marginTop: "4px" }}>Specificity</div>
          </div>
          <div style={{
            backgroundColor: "#e8f5e8",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
            border: "1px solid #a5d6a7"
          }}>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#388e3c" }}>
              {evaluation.weights.safety}
            </div>
            <div style={{ fontSize: "14px", color: "#424242", marginTop: "4px" }}>Safety</div>
          </div>
        </div>
      </div>

      {evaluation.results && evaluation.results.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ marginBottom: "16px", color: "#495057" }}>📊 Model Comparison</h3>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
            overflow: "hidden",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <table width="100%" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                  <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#495057" }}>Model</th>
                  <th style={{ padding: "16px", textAlign: "right", fontWeight: "600", color: "#495057" }}>Clarity</th>
                  <th style={{ padding: "16px", textAlign: "right", fontWeight: "600", color: "#495057" }}>Specificity</th>
                  <th style={{ padding: "16px", textAlign: "right", fontWeight: "600", color: "#495057" }}>Safety</th>
                  <th style={{ padding: "16px", textAlign: "right", fontWeight: "600", color: "#495057" }}>Overall</th>
                </tr>
              </thead>
              <tbody>
                {evaluation.results.map((result, index) => (
                  <tr
                    key={result.model}
                    style={{
                      borderBottom: index < evaluation.results!.length - 1 ? "1px solid #dee2e6" : "none",
                      backgroundColor: bestResult && result.model === bestResult.model ? "#d4edda" : "transparent",
                      transition: "background-color 0.2s ease"
                    }}
                  >
                    <td style={{
                      padding: "16px",
                      fontWeight: bestResult && result.model === bestResult.model ? "bold" : "normal",
                      color: "#495057"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          display: "inline-block",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: result.model.includes("GPT-4") ? "#10b981" :
                                         result.model.includes("GPT-5") ? "#3b82f6" :
                                         result.model.includes("Claude") ? "#f59e0b" : "#6b7280"
                        }}></span>
                        {result.model}
                        {bestResult && result.model === bestResult.model && (
                          <span style={{
                            backgroundColor: "#28a745",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "12px",
                            fontSize: "10px",
                            fontWeight: "bold"
                          }}>🏆 BEST</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right", color: "#6c757d" }}>
                      <div style={{
                        display: "inline-block",
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontWeight: "500"
                      }}>
                        {result.clarity.toFixed(1)}
                      </div>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right", color: "#6c757d" }}>
                      <div style={{
                        display: "inline-block",
                        backgroundColor: "#f3e5f5",
                        color: "#7b1fa2",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontWeight: "500"
                      }}>
                        {result.specificity.toFixed(1)}
                      </div>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right", color: "#6c757d" }}>
                      <div style={{
                        display: "inline-block",
                        backgroundColor: "#e8f5e8",
                        color: "#388e3c",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontWeight: "500"
                      }}>
                        {result.safety.toFixed(1)}
                      </div>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{
                        display: "inline-block",
                        backgroundColor: bestResult && result.model === bestResult.model ? "#28a745" : "#6c757d",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        fontSize: "14px"
                      }}>
                        {result.overall.toFixed(1)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{
        marginTop: "32px",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #e9ecef",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>📊 Status</div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "500",
            backgroundColor: evaluation.status === "DONE" ? "#d4edda" :
                           evaluation.status === "RUNNING" ? "#fff3cd" :
                           evaluation.status === "ERROR" ? "#f8d7da" : "#e2e3e5",
            color: evaluation.status === "DONE" ? "#155724" :
                  evaluation.status === "RUNNING" ? "#856404" :
                  evaluation.status === "ERROR" ? "#721c24" : "#383d41"
          }}>
            <span style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: evaluation.status === "DONE" ? "#28a745" :
                             evaluation.status === "RUNNING" ? "#ffc107" :
                             evaluation.status === "ERROR" ? "#dc3545" : "#6c757d"
            }}></span>
            {evaluation.status}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>📅 Created</div>
          <div style={{
            fontSize: "14px",
            color: "#495057",
            fontWeight: "500"
          }}>
            {new Date(evaluation.createdAt).toLocaleDateString()}
          </div>
          <div style={{
            fontSize: "12px",
            color: "#6c757d"
          }}>
            {new Date(evaluation.createdAt).toLocaleTimeString()}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>🎯 Models</div>
          <div style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#495057"
          }}>
            {evaluation.models?.length || 0}
          </div>
          <div style={{
            fontSize: "12px",
            color: "#6c757d"
          }}>
            Selected
          </div>
        </div>
      </div>
    </div>
  );
}
