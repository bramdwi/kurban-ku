"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  // Pagination
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyTitle,
  emptyDescription,
  page,
  pageSize,
  total,
  onPageChange,
}: DataTableProps<T>) {
  const hasPagination =
    page !== undefined &&
    pageSize !== undefined &&
    total !== undefined &&
    onPageChange !== undefined;

  const totalPages = hasPagination ? Math.ceil(total / pageSize) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ overflowX: "auto", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", background: "var(--color-bg-card)", fontSize: "var(--text-sm)" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg-secondary)" }}>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={col.className}
                  style={{
                    padding: "var(--space-3) var(--space-4)",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: pageSize || 5 }).map((_, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} style={{ padding: "var(--space-4)" }}>
                      <Skeleton height="20px" width={cIdx === 0 ? "80px" : "100%"} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: "var(--space-10)" }}>
                  <EmptyState
                    title={emptyTitle || "Tidak ada data"}
                    description={emptyDescription || "Data yang dicari tidak ditemukan"}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: "1px solid var(--color-border-light)",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--color-border-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {columns.map((col, cIdx) => {
                    const content =
                      typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode);

                    return (
                      <td
                        key={cIdx}
                        className={col.className}
                        style={{
                          padding: "var(--space-3) var(--space-4)",
                          color: "var(--color-text-primary)",
                          verticalAlign: "middle",
                        }}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasPagination && total > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-2) var(--space-1)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)",
          }}
        >
          <div>
            Menampilkan <strong>{Math.min((page - 1) * pageSize + 1, total)}</strong> sampai{" "}
            <strong>{Math.min(page * pageSize, total)}</strong> dari <strong>{total}</strong> data
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="btn btn-secondary btn-sm"
              style={{ padding: "4px 8px" }}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              Sebelumnya
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 var(--space-3)",
                fontWeight: 600,
              }}
            >
              Halaman {page} dari {totalPages}
            </div>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="btn btn-secondary btn-sm"
              style={{ padding: "4px 8px" }}
              aria-label="Next page"
            >
              Berikutnya
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
