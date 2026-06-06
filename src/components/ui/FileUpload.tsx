"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  label?: string;
  previewUrl?: string;
  onClear?: () => void;
}

export default function FileUpload({
  onUploadSuccess,
  onUploadStart,
  onUploadEnd,
  label = "Unggah Foto",
  previewUrl,
  onClear,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format file harus JPG, JPEG, PNG atau WEBP");
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setIsUploading(true);
    if (onUploadStart) onUploadStart();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        onUploadSuccess(json.data.url);
        toast.success("Foto berhasil diunggah");
      } else {
        toast.error(json.error || "Gagal mengunggah foto");
      }
    } catch (err) {
      toast.error("Gagal mengunggah foto ke server");
    } finally {
      setIsUploading(false);
      if (onUploadEnd) onUploadEnd();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>

      {previewUrl ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "180px",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-secondary)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="btn btn-danger btn-icon btn-sm"
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                borderRadius: "var(--radius-full)",
                padding: "4px",
              }}
              title="Hapus foto"
              aria-label="Remove photo"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          style={{
            width: "100%",
            height: "180px",
            border: dragActive
              ? "2px dashed var(--color-accent)"
              : "2px dashed var(--color-border)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: isUploading ? "not-allowed" : "pointer",
            background: dragActive ? "var(--color-accent-bg)" : "var(--color-bg-card)",
            transition: "all var(--transition-fast)",
            padding: "var(--space-4)",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleInputChange}
            accept="image/*"
            style={{ display: "none" }}
            disabled={isUploading}
          />
          {isUploading ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  border: "3px solid var(--color-border)",
                  borderTopColor: "var(--color-accent)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto var(--space-3) auto",
                }}
              />
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                Mengunggah foto...
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  color: "var(--color-text-muted)",
                  marginBottom: "var(--space-2)",
                }}
              >
                <Upload size={28} />
              </div>
              <p style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>
                Tarik & lepas foto di sini, atau klik untuk memilih
              </p>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
                Format didukung: JPG, PNG, WEBP (Maksimal 5MB)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
