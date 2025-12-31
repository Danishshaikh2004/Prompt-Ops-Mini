"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Migration } from "@/types";

export default function PromptMigrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [modelFilter, setModelFilter] = useState(searchParams.get("model") || "");
  const [sortBy, setSortBy] = useState<"createdAt" | "name">(searchParams.get("sort") as "createdAt" | "name" || "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(searchParams.get("order") as "asc" | "desc" || "desc");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || 10);

  useEffect(() => {
    fetchMigrations();
  }, [search, statusFilter, modelFilter, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
 
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (modelFilter) params.set("model", modelFilter);
    if (sortBy !== "createdAt") params.set("sort", sortBy);
    if (sortOrder !== "desc") params.set("order", sortOrder);
    if (page !== 1) params.set("page", page.toString());
    if (pageSize !== 10) params.set("pageSize", pageSize.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : "";
    router.replace(`/prompt-migration${newUrl}`, { scroll: false });
  }, [search, statusFilter, modelFilter, sortBy, sortOrder, page, pageSize, router]);

  const fetchMigrations = async () => {
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
      const res = await fetch(`/api/migrations?${params}`);
      const data = await res.json();
      setMigrations(data.migrations || []);
    } catch (error) {
      console.error("Failed to fetch migrations:", error);
      setMigrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this migration?")) {
      try {
        await fetch(`/api/migrations/${id}`, { method: 'DELETE' });
        fetchMigrations(); 
      } catch (error) {
        console.error("Failed to delete migration:", error);
      }
    }
  };

  return (
    <div style={{ padding: "32px" }}>
      <h1>Prompt Migrations</h1>

      <Link href="/prompt-migration/new">
        <strong style={{ color: "#8b5cf6" }}>+ New Migration</strong>
      </Link>

      <br /><br />


      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", minWidth: "200px" }}
          aria-label="Search migrations"
        />

        <label htmlFor="status-filter" style={{ fontSize: "14px" }}>Status:</label>
        <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="RUNNING">Running</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>

        <label htmlFor="model-filter" style={{ fontSize: "14px" }}>Model:</label>
        <select id="model-filter" value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
          <option value="">All Models</option>
          <option value="gpt-3.5">GPT-3.5</option>
          <option value="gpt-4">GPT-4</option>
          <option value="claude-3">Claude-3</option>
        </select>

        <label htmlFor="sort-by" style={{ fontSize: "14px" }}>Sort by:</label>
        <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value as "createdAt" | "name")}>
          <option value="createdAt">Date</option>
          <option value="name">Name</option>
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

      {loading && <p>Loading migrations...</p>}

      {!loading && migrations.length === 0 && (
        <p style={{ opacity: 0.7 }}>No migrations found.</p>
      )}

      {migrations.length > 0 && (
        <>
          <div style={{  backgroundColor: "#f8f9fa", overflowX: "auto", border: "1px solid  #dee2e6", borderRadius: "8px" , boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"}}>
            <table width="100%" cellPadding={16} style={{ borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Name</th>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Source Model</th>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Target Model</th>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Status</th>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Created At</th>
                  <th align="left" style={{ fontWeight: "600", color: "#495057", padding: "12px 16px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {migrations.map((migration, index) => (
                  <tr key={migration.id} style={{
                    borderBottom: "1px solid #dee2e6",
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                    transition: "background-color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e9ecef"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa"}
                  >
                    <td style={{ padding: "12px 16px", color: "#495057" }}>{migration.name}</td>
                    <td style={{ padding: "12px 16px", color: "#495057" }}>{migration.sourceModel}</td>
                    <td style={{ padding: "12px 16px", color: "#495057" }}>{migration.targetModel}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: migration.status === "COMPLETED" ? "#d4edda" :
                                       migration.status === "RUNNING" ? "#fff3cd" :
                                       migration.status === "FAILED" ? "#f8d7da" : "#e2e3e5",
                        color: migration.status === "COMPLETED" ? "#155724" :
                              migration.status === "RUNNING" ? "#856404" :
                              migration.status === "FAILED" ? "#721c24" : "#383d41",
                        border: `1px solid ${migration.status === "COMPLETED" ? "#c3e6cb" :
                                           migration.status === "RUNNING" ? "#ffeaa7" :
                                           migration.status === "FAILED" ? "#f5c6cb" : "#d1d3d4"}`
                      }}>
                        {migration.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6c757d", fontSize: "13px" }}>
                      {new Date(migration.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px", display: "flex", gap: "8px" }}>
                      <Link
                        href={`/prompt-migration/${migration.id}`}
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
                        onClick={() => handleDelete(migration.id)}
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
              disabled={migrations.length < pageSize}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
