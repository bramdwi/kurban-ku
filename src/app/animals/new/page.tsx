"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import FileUpload from "@/components/ui/FileUpload";
import { Species } from "@/types";

export default function NewAnimalPage() {
  const router = useRouter();
  
  // Form values
  const [species, setSpecies] = useState<Species>("SAPI");
  const [weight, setWeight] = useState<number | "">("");
  const [purchasePrice, setPurchasePrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  
  // Photos state
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUploadSuccess = (url: string) => {
    setPhotoUrls((prev) => [...prev, url]);
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotoUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !purchasePrice || !sellingPrice) {
      toast.error("Semua field bertanda bintang wajib diisi");
      return;
    }

    setSubmitting(true);
    const payload = {
      species,
      weight: Number(weight),
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      status: "AVAILABLE",
      description,
      photoUrls,
    };

    try {
      const res = await fetch("/api/animals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Hewan kurban berhasil ditambahkan!");
        router.push("/animals");
      } else {
        toast.error(json.error || "Gagal menyimpan data");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <Link href="/animals" className="btn btn-secondary btn-icon" title="Kembali ke Daftar">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Tambah Hewan Kurban</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Masukkan spesifikasi lengkap hewan kurban baru Anda. Kode hewan dan kelas tipe akan otomatis ditentukan.
          </p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Species */}
          <div className="form-group">
            <label className="form-label" htmlFor="species-select">
              Jenis Hewan <span className="required">*</span>
            </label>
            <select
              id="species-select"
              className="form-select"
              value={species}
              onChange={(e) => setSpecies(e.target.value as Species)}
              disabled={submitting}
            >
              <option value="SAPI">Sapi</option>
              <option value="KAMBING">Kambing</option>
              <option value="DOMBA">Domba</option>
            </select>
          </div>

          {/* Weight */}
          <div className="form-group">
            <label className="form-label" htmlFor="weight-input">
              Berat Hewan (kg) <span className="required">*</span>
            </label>
            <input
              id="weight-input"
              type="number"
              step="0.1"
              className="form-input"
              placeholder="Masukkan berat dalam kg, contoh: 320.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value === "" ? "" : parseFloat(e.target.value))}
              required
              disabled={submitting}
            />
          </div>

          {/* Prices */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="purchase-price-input">
                Harga Modal (IDR) <span className="required">*</span>
              </label>
              <input
                id="purchase-price-input"
                type="number"
                className="form-input"
                placeholder="Contoh: 18000000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                required
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="selling-price-input">
                Harga Jual (IDR) <span className="required">*</span>
              </label>
              <input
                id="selling-price-input"
                type="number"
                className="form-input"
                placeholder="Contoh: 22000000"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description-input">Keterangan / Deskripsi</label>
            <textarea
              id="description-input"
              className="form-textarea"
              placeholder="Contoh: Sapi Limosin sehat, nafsu makan baik, gigi sudah kupak 2 pasang..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Upload Section */}
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "var(--space-4)",
              marginTop: "var(--space-2)",
            }}
          >
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-3)" }}>
              Foto Hewan Kurban
            </h3>

            {/* List of uploaded photos */}
            {photoUrls.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: "var(--space-3)",
                  marginBottom: "var(--space-4)",
                }}
              >
                {photoUrls.map((url, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      height: "100px",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Upload ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="btn btn-danger btn-icon btn-sm"
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        borderRadius: "var(--radius-full)",
                        padding: "2px",
                      }}
                      title="Hapus"
                      aria-label={`Remove photo ${idx + 1}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Photo Uploader */}
            <FileUpload
              onUploadSuccess={handlePhotoUploadSuccess}
              label="Unggah Foto Hewan"
              onUploadStart={() => {}}
              onUploadEnd={() => {}}
            />
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-3)",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "var(--space-4)",
              marginTop: "var(--space-2)",
            }}
          >
            <Link href="/animals" className="btn btn-secondary" style={{ pointerEvents: submitting ? "none" : undefined }}>
              Batal
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                "Menyimpan..."
              ) : (
                <>
                  <Plus size={18} />
                  Simpan Hewan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
