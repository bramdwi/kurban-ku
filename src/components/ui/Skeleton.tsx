"use client";

import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({
  width = "100%",
  height = "16px",
  circle = false,
  className,
  style,
}: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: circle ? "50%" : "var(--radius-sm)",
        background: "linear-gradient(90deg, var(--color-border) 25%, var(--color-bg-secondary) 50%, var(--color-border) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite linear",
        ...style,
      }}
    >
    </div>
  );
}
