"use client";

import React from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({
  title = "Tidak ada data ditemukan",
  description = "Coba ubah kata kunci pencarian atau filter Anda.",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-8) var(--space-4)",
        textAlign: "center",
        color: "var(--color-text-secondary)",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-full)",
          background: "var(--color-bg-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
          marginBottom: "var(--space-4)",
        }}
      >
        {icon || <Inbox size={28} />}
      </div>
      <h3
        style={{
          fontSize: "var(--text-base)",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginBottom: "var(--space-1)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
          maxWidth: "320px",
          margin: "0 auto var(--space-4) auto",
        }}
      >
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
