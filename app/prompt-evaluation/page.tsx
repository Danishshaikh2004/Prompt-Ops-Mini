"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Evaluation } from "@/types";

export default function PromptEvaluationPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchEvaluations();
  }, [search, statusFilter, modelFilter, sortBy, sortOrder, page, pageSize]);

  const fetchEvaluations = async () => {
    const params = new URLSearchParams({
      search,
      status: statusFilter,
      model: modelFilter,
      sort: sortBy,
      order: sortOrder,
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    try {
      const res = await fetch(`/api/evaluations?${params}`);
      const data = await res.json();
      setEvaluations(data.evaluations || []);
    } catch (error) {
      console.error("Failed to fetch evaluations:", error);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this evaluation?")) {
      try {
        await fetch(`/api/evaluations/${id}`, { method: 'DELETE' });
        fetchEvaluations(); 
      } catch (error) {
        console.error("Failed to delete evaluation:", error);
      }
    }
  };

  const getBestScore = (evaluation: Evaluation) => {
    if (!evaluation.results) return 0;
    return Math.max(...evaluation.results.map(r => r.overall));
  };

  return (
    <div style={{ padding: "32px" }}>
      <h1>Prompt Evaluations</h1>

      <Link href="/prompt-evaluation/new">
        <strong style={{ color: "#8b5cf6" }}>＋ New Evaluation</strong>
      </Link>

      <br /><br />


      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search by name or prompt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", minWidth: "200px" }}
          aria-label="Search evaluations"
        />

        <label htmlFor="status-filter" style={{ fontSize: "14px" }}>Status:</label>
        <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="QUEUED">Queued</option>
          <option value="RUNNING">Running</option>
          <option value="DONE">Done</option>
          <option value="ERROR">Error</option>
        </select>

        <label htmlFor="model-filter" style={{ fontSize: "14px" }}>Model:</label>
        <select id="model-filter" value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
          <option value="">All Models</option>
          <option value="GPT-4.1">GPT-4.1</option>
          <option value="GPT-5.2">GPT-5.2</option>
          <option value="Claude 3.5">Claude 3.5</option>
        </select>

        <label htmlFor="sort-by" style={{ fontSize: "14px" }}>Sort by:</label>
        <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value as "score" | "createdAt")}>
          <option value="createdAt">Date</option>
          <option value="score">Score</option>
        </select>

        <label htmlFor="sort-order" style={{ fontSize: "14px" }}>Order:</label>
        <select id="sort-order" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        <label htmlFor="page-size" style={{ fontSize: "14px" }}>Per page:</label>
        <select id="page-size" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {loading && <p>Loading evaluations...</p>}

      {!loading && evaluations.length === 0 && (
        <p style={{ opacity: 0.7 }}>No evaluations found.</p>
      )}

      {evaluations.length > 0 && (
        <>
          <div style={{ backgroundColor: "#f8f9fa",overflowX: "auto", border: "1px solid #e1e5e9", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <table width="100%" cellPadding={16} style={{ borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Name</th>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Prompt Snippet</th>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Models</th>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Overall Score</th>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Status</th>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Created At</th>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evaluation, index) => (
                  <tr key={evaluation.id} style={{
                    borderBottom: "1px solid #dee2e6",
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                    transition: "background-color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e9ecef"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa"}
                  >
                    <td style={{ padding: "12px 16px", color: "#495057" }}>{evaluation.name}</td>
                    <td style={{ padding: "12px 16px", color: "#6c757d", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {evaluation.prompt.substring(0, 50)}...
                    </td>
                    <td style={{ padding: "12px 16px", color: "#495057" }}>{evaluation.models.join(", ")}</td>
                    <td style={{ padding: "12px 16px", color: "#495057", fontWeight: "500" }}>
                      {evaluation.results ? getBestScore(evaluation).toFixed(1) : "N/A"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: evaluation.status === "DONE" ? "#d4edda" :
                                       evaluation.status === "RUNNING" ? "#fff3cd" :
                                       evaluation.status === "ERROR" ? "#f8d7da" : "#e2e3e5",
                        color: evaluation.status === "DONE" ? "#155724" :
                              evaluation.status === "RUNNING" ? "#856404" :
                              evaluation.status === "ERROR" ? "#721c24" : "#383d41",
                        border: `1px solid ${evaluation.status === "DONE" ? "#c3e6cb" :
                                           evaluation.status === "RUNNING" ? "#ffeaa7" :
                                           evaluation.status === "ERROR" ? "#f5c6cb" : "#d1d3d4"}`
                      }}>
                        {evaluation.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6c757d", fontSize: "13px" }}>
                      {new Date(evaluation.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px", display: "flex", gap: "8px" }}>
                      <Link
                        href={`/prompt-evaluation/${evaluation.id}`}
                        style={{
                          color: "#007bff",
                          textDecoration: "none",
                          fontWeight: "500",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "1px solid #007bff",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#007bff";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#007bff";
                        }}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(evaluation.id)}
                        style={{
                          color: "#dc3545",
                          backgroundColor: "transparent",
                          border: "1px solid #dc3545",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#dc3545";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#dc3545";
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "16px" }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={evaluations.length < pageSize}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
