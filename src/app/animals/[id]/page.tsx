"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit2, Beef, Tag, CheckCircle, Clock, FileText, Sparkles, Banknote } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Animal } from "@/types";
import toast from "react-hot-toast";
import { formatCurrency, getSpeciesLabel, getStatusConfig } from "@/lib/utils";
import Skeleton from "@/components/ui/Skeleton";

export default function AnimalDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { user } = useAuth();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const canEdit = user?.role === "OWNER" || user?.role === "STAFF";

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const res = await fetch(`/api/animals/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setAnimal(json.data);
          } else {
            toast.error(json.error || "Hewan tidak ditemukan");
            router.push("/animals");
          }
        }
      } catch (err) {
        toast.error("Gagal memuat detail hewan");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimal();
  }, [id, router]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "var(--space-4)" }}>
          <Skeleton height="38px" width="38px" circle />
          <Skeleton height="38px" width="200px" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
          <Skeleton height="300px" />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <Skeleton height="40px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="150px" />
          </div>
        </div>
      </div>
    );
  }

  if (!animal) return null;

  const statusConfig = getStatusConfig(animal.status);
  const profit = animal.sellingPrice - animal.purchasePrice;
  const profitMargin = ((profit / animal.purchasePrice) * 100).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <Link href="/animals" className="btn btn-secondary btn-icon" title="Kembali ke Daftar">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>{animal.code}</h2>
              <span className={`status-badge ${statusConfig.variant}`}>{statusConfig.label}</span>
            </div>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
              Detail spesifikasi dan riwayat data hewan kurban.
            </p>
          </div>
        </div>

        {canEdit && (
          <Link href={`/animals/${animal.id}/edit`} className="btn btn-primary">
            <Edit2 size={16} />
            Ubah Data
          </Link>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-6)" }}>
        {/* Left column - Photos */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div
            className="card"
            style={{
              padding: 0,
              height: "320px",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              position: "relative",
            }}
          >
            {animal.photos && animal.photos.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={animal.photos[activePhotoIdx].photoUrl}
                alt={`${animal.code}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--color-text-muted)" }}>
                <Beef size={64} style={{ opacity: 0.3, marginBottom: "var(--space-2)" }} />
                <span>Belum ada foto</span>
              </div>
            )}
          </div>

          {/* Photo Selector Thumbnail Grid */}
          {animal.photos && animal.photos.length > 1 && (
            <div style={{ display: "flex", gap: "var(--space-3)", overflowX: "auto", paddingBottom: "var(--space-1)" }}>
              {animal.photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setActivePhotoIdx(idx)}
                  style={{
                    position: "relative",
                    width: "72px",
                    height: "72px",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    border: activePhotoIdx === idx ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                    padding: 0,
                    cursor: "pointer",
                    flexShrink: 0,
                    outline: "none",
                  }}
                  aria-label={`View photo ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.photoUrl}
                    alt="Thumbnail"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column - Info Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-2)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Sparkles size={18} style={{ color: "var(--color-accent)" }} />
              Spesifikasi Hewan
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Jenis Hewan</span>
                <p style={{ fontWeight: 700, fontSize: "var(--text-base)", marginTop: "2px" }}>{getSpeciesLabel(animal.species)}</p>
              </div>
              <div>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Berat Bobot</span>
                <p style={{ fontWeight: 700, fontSize: "var(--text-base)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>{animal.weight} kg</p>
              </div>
              <div>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Kelas Tipe</span>
                <p style={{ fontWeight: 700, fontSize: "var(--text-base)", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Tag size={16} style={{ color: "var(--color-accent)" }} />
                  {animal.animalType?.typeName || "-"}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Rentang Tipe</span>
                <p style={{ fontSize: "var(--text-sm)", marginTop: "2px", color: "var(--color-text-secondary)" }}>
                  {animal.animalType ? `(${animal.animalType.minWeight} - ${animal.animalType.maxWeight} kg)` : "-"}
                </p>
              </div>
            </div>

            {animal.description && (
              <div style={{ marginTop: "var(--space-2)" }}>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Keterangan Tambahan</span>
                <p style={{ fontSize: "var(--text-sm)", marginTop: "4px", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>{animal.description}</p>
              </div>
            )}
          </div>

          {/* Pricing & Profitability card */}
          {user?.role === "OWNER" && (
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-2)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <Banknote size={18} style={{ color: "var(--color-success)" }} />
                Informasi Keuangan
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Harga Modal</span>
                  <p style={{ fontWeight: 700, fontSize: "var(--text-base)", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}>{formatCurrency(animal.purchasePrice)}</p>
                </div>
                <div>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Harga Jual</span>
                  <p style={{ fontWeight: 700, fontSize: "var(--text-base)", fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>{formatCurrency(animal.sellingPrice)}</p>
                </div>
              </div>

              <div
                style={{
                  background: "var(--color-success-bg)",
                  border: "1px solid rgba(45, 139, 78, 0.2)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3) var(--space-4)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-success)" }}>Estimasi Keuntungan</span>
                  <p style={{ fontWeight: 800, fontSize: "var(--text-lg)", fontFamily: "var(--font-mono)", color: "var(--color-success)", marginTop: "2px" }}>
                    {formatCurrency(profit)}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-success)" }}>Margin Keuntungan</span>
                  <p style={{ fontWeight: 800, fontSize: "var(--text-lg)", fontFamily: "var(--font-mono)", color: "var(--color-success)", marginTop: "2px" }}>
                    +{profitMargin}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
