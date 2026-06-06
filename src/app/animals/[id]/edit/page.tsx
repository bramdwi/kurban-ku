"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import FileUpload from "@/components/ui/FileUpload";
import { Species, AnimalStatus } from "@/types";
import Skeleton from "@/components/ui/Skeleton";

export default function EditAnimalPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  // Form states
  const [species, setSpecies] = useState<Species>("SAPI");
  const [weight, setWeight] = useState<number | "">("");
  const [purchasePrice, setPurchasePrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [status, setStatus] = useState<AnimalStatus>("AVAILABLE");
  const [description, setDescription] = useState("");
  
  // Photos state
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  
  // Loading & Submission states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const res = await fetch(`/api/animals/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            const animal = json.data;
            setSpecies(animal.species);
            setWeight(animal.weight);
            setPurchasePrice(animal.purchasePrice);
            setSellingPrice(animal.sellingPrice);
            setStatus(animal.status);
            setDescription(animal.description || "");
            setPhotoUrls(animal.photos?.map((p: any) => p.photoUrl) || []);
          } else {
            toast.error(json.error || "Hewan tidak ditemukan");
            router.push("/animals");
          }
        }
      } catch (err) {
        toast.error("Gagal memuat data hewan");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimal();
  }, [id, router]);

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
      status,
      description,
      photoUrls,
    };

    try {
      const res = await fetch(`/api/animals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Data hewan kurban berhasil diperbarui!");
        router.push(`/animals/${id}`);
      } else {
        toast.error(json.error || "Gagal memperbarui data");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "var(--space-4)" }}>
          <Skeleton height="38px" width="38px" circle />
          <Skeleton height="38px" width="200px" />
        </div>
        <Skeleton height="400px" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <Link href={`/animals/${id}`} className="btn btn-secondary btn-icon" title="Kembali ke Detail">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Ubah Data Hewan Kurban</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Perbarui spesifikasi dan status hewan kurban ini. Tipe kelas hewan akan otomatis disesuaikan dengan bobot baru.
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
              placeholder="Masukkan berat dalam kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value === "" ? "" : parseFloat(e.target.value))}
              required
              disabled={submitting}
            />
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="form-label" htmlFor="status-select">
              Status Hewan <span className="required">*</span>
            </label>
            <select
              id="status-select"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as AnimalStatus)}
              disabled={submitting}
            >
              <option value="AVAILABLE">Tersedia</option>
              <option value="BOOKED">Dipesan</option>
              <option value="SOLD">Terjual</option>
              <option value="DEAD">Mati</option>
            </select>
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
              placeholder="Spesifikasi tambahan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Photos upload section */}
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

            <FileUpload
              onUploadSuccess={handlePhotoUploadSuccess}
              label="Unggah Foto Baru"
              onUploadStart={() => {}}
              onUploadEnd={() => {}}
            />
          </div>

          {/* Actions */}
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
            <Link href={`/animals/${id}`} className="btn btn-secondary" style={{ pointerEvents: submitting ? "none" : undefined }}>
              Batal
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                "Menyimpan..."
              ) : (
                <>
                  <Save size={18} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
