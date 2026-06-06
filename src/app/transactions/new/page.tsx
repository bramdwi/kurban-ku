"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, DollarSign, Calendar, ShoppingBag } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Buyer, Animal } from "@/types";
import { formatCurrency, getSpeciesLabel } from "@/lib/utils";
import Skeleton from "@/components/ui/Skeleton";

export default function NewTransactionPage() {
  const router = useRouter();

  // Data lists
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [buyerId, setBuyerId] = useState("");
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([]);
  const [dpAmount, setDpAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [buyersRes, animalsRes] = await Promise.all([
          fetch("/api/buyers"),
          fetch("/api/animals?status=AVAILABLE&pageSize=100"),
        ]);

        if (buyersRes.ok && animalsRes.ok) {
          const buyersJson = await buyersRes.json();
          const animalsJson = await animalsRes.json();

          if (buyersJson.success) setBuyers(buyersJson.data);
          if (animalsJson.success) setAnimals(animalsJson.data);
        }
      } catch (err) {
        toast.error("Gagal memuat data pembeli atau hewan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAnimalSelect = (id: string) => {
    setSelectedAnimalIds((prev) =>
      prev.includes(id) ? prev.filter((aId) => aId !== id) : [...prev, id]
    );
  };

  const getSelectedAnimalsTotal = () => {
    return animals
      .filter((a) => selectedAnimalIds.includes(a.id))
      .reduce((sum, a) => sum + a.sellingPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerId) {
      toast.error("Pembeli wajib dipilih");
      return;
    }

    if (selectedAnimalIds.length === 0) {
      toast.error("Minimal harus memilih 1 hewan kurban");
      return;
    }

    const total = getSelectedAnimalsTotal();
    const dp = Number(dpAmount || 0);

    if (dp > total) {
      toast.error("Pembayaran DP tidak boleh melebihi total nilai transaksi");
      return;
    }

    setSubmitting(true);
    const payload = {
      buyerId,
      animalIds: selectedAnimalIds,
      dpAmount: dp,
      paymentMethod,
      notes,
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Transaksi penjualan berhasil dibuat!");
        router.push("/transactions");
      } else {
        toast.error(json.error || "Gagal membuat transaksi");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "900px", margin: "0 auto" }}>
        <Skeleton height="38px" width="300px" />
        <Skeleton height="500px" />
      </div>
    );
  }

  const selectedTotal = getSelectedAnimalsTotal();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <Link href="/transactions" className="btn btn-secondary btn-icon" title="Kembali ke Daftar">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Buat Transaksi Penjualan Baru</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Pilih pembeli dan hewan kurban yang dipesan, lalu tentukan metode pembayaran DP/Cicilan/Lunas.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-6)" }}>
        {/* Left Form column */}
        <div className="card" style={{ height: "fit-content" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-2)" }}>
              Detail Transaksi
            </h3>

            {/* Buyer Select */}
            <div className="form-group">
              <label className="form-label" htmlFor="buyer-select">
                Pilih Pembeli <span className="required">*</span>
              </label>
              <select
                id="buyer-select"
                className="form-select"
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
                required
                disabled={submitting}
              >
                <option value="">-- Pilih Pembeli --</option>
                {buyers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.phone ? `(${b.phone})` : ""}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: "6px" }}>
                <Link href="/buyers" style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>
                  + Tambah Pembeli Baru
                </Link>
              </div>
            </div>

            {/* DP Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="dp-input">Jumlah Uang Muka / DP (IDR)</label>
              <input
                id="dp-input"
                type="number"
                className="form-input"
                placeholder="Biarkan 0 jika belum bayar, isi lunas jika pembayaran penuh"
                value={dpAmount}
                onChange={(e) => setDpAmount(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                disabled={submitting}
              />
            </div>

            {/* Payment Method */}
            <div className="form-group">
              <label className="form-label" htmlFor="payment-method-select">Metode Pembayaran</label>
              <select
                id="payment-method-select"
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={submitting}
              >
                <option value="CASH">Tunai (Cash)</option>
                <option value="TRANSFER">Transfer Bank</option>
                <option value="QRIS">QRIS</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="notes-input">Catatan Transaksi</label>
              <textarea
                id="notes-input"
                className="form-textarea"
                placeholder="Catatan tambahan, contoh: Pengiriman H-2 kurban..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Pricing Summary Widget */}
            <div
              style={{
                background: "var(--color-bg-secondary)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-4)",
                border: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span>Total Nilai Hewan:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                  {formatCurrency(selectedTotal)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span>Pembayaran DP:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-success)" }}>
                  {formatCurrency(Number(dpAmount || 0))}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "var(--text-base)",
                  fontWeight: 800,
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "var(--space-2)",
                  marginTop: "var(--space-1)",
                }}
              >
                <span>Sisa Tagihan:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-danger)" }}>
                  {formatCurrency(Math.max(0, selectedTotal - Number(dpAmount || 0)))}
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: "46px" }} disabled={submitting}>
              {submitting ? "Memproses..." : "Buat Transaksi"}
            </button>
          </form>
        </div>

        {/* Right Animal Selector column */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-3)", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShoppingBag size={18} style={{ color: "var(--color-accent)" }} />
            Pilih Hewan Kurban Tersedia ({animals.length})
          </h3>

          <div style={{ flex: 1, overflowY: "auto", maxHeight: "500px", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {animals.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "var(--space-6)" }}>
                Tidak ada hewan kurban yang tersedia saat ini.
              </p>
            ) : (
              animals.map((animal) => {
                const isSelected = selectedAnimalIds.includes(animal.id);
                return (
                  <div
                    key={animal.id}
                    onClick={() => handleAnimalSelect(animal.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                      border: isSelected ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                      background: isSelected ? "var(--color-accent-bg)" : "var(--color-bg-card)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ cursor: "pointer", width: "16px", height: "16px" }}
                      aria-label={`Select ${animal.code}`}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{animal.code}</span>
                        <span style={{ fontWeight: 700, fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)" }}>
                          {formatCurrency(animal.sellingPrice)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                        <span>{getSpeciesLabel(animal.species)} - {animal.animalType?.typeName || "Tanpa Kelas"}</span>
                        <span>{animal.weight} kg</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
