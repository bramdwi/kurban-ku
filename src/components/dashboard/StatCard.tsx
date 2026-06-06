"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "accent" | "success" | "warning" | "danger" | "info";
  change?: {
    type: "up" | "down";
    text: string;
  };
}

export default function StatCard({
  label,
  value,
  icon,
  variant = "accent",
  change,
}: StatCardProps) {
  return (
    <div className={cn("stat-card", variant)}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className={cn("stat-card-icon", variant)}>{icon}</div>
      </div>
      <div className="stat-card-value">{value}</div>
      {change && (
        <div className={cn("stat-card-change", change.type)}>
          <span>{change.type === "up" ? "▲" : "▼"}</span>
          <span>{change.text}</span>
        </div>
      )}
    </div>
  );
}
