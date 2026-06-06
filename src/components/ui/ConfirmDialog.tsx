"use client";

import React from "react";
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  isDanger = true,
  isLoading = false,
}: ConfirmDialogProps) {
  const footer = (
    <>
      <button
        onClick={onClose}
        className="btn btn-secondary"
        disabled={isLoading}
      >
        {cancelLabel}
      </button>
      <button
        onClick={onConfirm}
        className={isDanger ? "btn btn-danger" : "btn btn-primary"}
        disabled={isLoading}
      >
        {isLoading ? "Memproses..." : confirmLabel}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
    >
      <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
        {isDanger && (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--color-danger-bg)",
              color: "var(--color-danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} />
          </div>
        )}
        <div>
          <p style={{ color: "var(--color-text-primary)", fontSize: "var(--text-base)", marginBottom: "var(--space-2)" }}>
            {message}
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </div>
    </Modal>
  );
}
