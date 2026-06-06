"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trash2, Plus, Calendar, DollarSign, User, MapPin, Phone, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Transaction } from "@/types";
import toast from "react-hot-toast";
import { formatCurrency, formatDateTime, getSpeciesLabel, getStatusConfig } from "@/lib/utils";
import Skeleton from "@/components/ui/Skeleton";

export default function TransactionDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { user } = useAuth();

  // Data state
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Payment form state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number | "">("");
  const [payMethod, setPayMethod] = useState("TRANSFER");
  const [payType, setPayType] = useState<"INSTALLMENT" | "FULL_PAYMENT">("INSTALLMENT");
  const [payNotes, setPayNotes] = useState("");

  // Cancel transaction state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const canManage = user?.role === "OWNER" || user?.role === "STAFF";
  const canCancel = user?.role === "OWNER";

  const fetchTransaction = async () => {
    try {
      const res = await fetch(`/api/transactions/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setTx(json.data);
        } else {
          toast.error(json.error || "Transaksi tidak ditemukan");
          router.push("/transactions");
        }
      }
    } catch (err) {
      toast.error("Gagal memuat detail transaksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount) {
      toast.error("Jumlah pembayaran wajib diisi");
      return;
    }

    setSubmitting(true);
    const payload = {
      amount: Number(payAmount),
      paymentType: payType,
      paymentMethod: payMethod,
      notes: payNotes,
    };

    try {
      const res = await fetch(`/api/transactions/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Pembayaran berhasil dicatat");
        setPaymentModalOpen(false);
        // Reset states
        setPayAmount("");
        setPayNotes("");
        fetchTransaction();
      } else {
        toast.error(json.error || "Gagal mencatat pembayaran");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTransaction = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Transaksi berhasil dibatalkan");
        setCancelDialogOpen(false);
        router.push("/transactions");
      } else {
        toast.error(json.error || "Gagal membatalkan transaksi");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "1000px", margin: "0 auto" }}>
        <Skeleton height="38px" width="300px" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
          <Skeleton height="250px" />
          <Skeleton height="250px" />
        </div>
      </div>
    );
  }

  if (!tx) return null;

  const payStatus = getStatusConfig(tx.paymentStatus);
  const txStatus = getStatusConfig(tx.status);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <Link href="/transactions" className="btn btn-secondary btn-icon" title="Kembali ke Daftar">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Invoice {tx.invoiceNumber}</h2>
              <span className={`status-badge ${payStatus.variant}`}>{payStatus.label}</span>
              <span className={`status-badge ${txStatus.variant}`}>{txStatus.label}</span>
            </div>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
              Dibuat oleh {tx.creator?.name} pada {formatDateTime(tx.transactionDate)}.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Link href={`/transactions/${tx.id}/invoice`} className="btn btn-secondary">
            <FileText size={16} />
            Cetak Invoice
          </Link>

          {canManage && tx.remainingAmount > 0 && tx.status !== "CANCELLED" && (
            <button onClick={() => setPaymentModalOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              Catat Pembayaran
            </button>
          )}

          {canCancel && tx.status !== "CANCELLED" && (
            <button onClick={() => setCancelDialogOpen(true)} className="btn btn-danger">
              <Trash2 size={16} />
              Batalkan Transaksi
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-6)" }}>
        {/* Left column - Buyer & Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Buyer info card */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-2)", display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={18} style={{ color: "var(--color-accent)" }} />
              Informasi Pembeli
            </h3>
            <p style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>{tx.buyer?.name}</p>
            {tx.buyer?.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                <Phone size={14} style={{ color: "var(--color-text-muted)" }} />
                <span>{tx.buyer.phone}</span>
              </div>
            )}
            {tx.buyer?.address && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                <MapPin size={14} style={{ color: "var(--color-text-muted)", marginTop: "3px", flexShrink: 0 }} />
                <span>{tx.buyer.address}</span>
              </div>
            )}
          </div>

          {/* Items Checklist card */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-2)" }}>
              Hewan Kurban Dipesan ({tx.items?.length || 0})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {tx.items?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid var(--color-border-light)",
                    paddingBottom: "var(--space-2)",
                  }}
                >
                  <div>
                    <Link href={`/animals/${item.animal?.id}`} style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>
                      {item.animal?.code}
                    </Link>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "2px" }}>
                      {item.animal ? `${getSpeciesLabel(item.animal.species)} - ${item.animal.weight} kg` : "-"}
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Payments log & Financial summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Financial summary */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-2)" }}>
              Ringkasan Pembayaran
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span>Total Tagihan:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "var(--text-base)" }}>
                  {formatCurrency(tx.totalAmount)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span>Total Dibayar:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "var(--text-base)", color: "var(--color-success)" }}>
                  {formatCurrency(tx.paidAmount)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "var(--text-base)",
                  fontWeight: 800,
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "var(--space-3)",
                  marginTop: "var(--space-1)",
                }}
              >
                <span>Sisa Tagihan:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: tx.remainingAmount > 0 ? "var(--color-danger)" : "var(--color-success)" }}>
                  {formatCurrency(tx.remainingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payments List card */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-2)" }}>
              Riwayat Pembayaran
            </h3>
            {tx.payments && tx.payments.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", textAlign: "center", padding: "var(--space-4)" }}>
                Belum ada pembayaran dicatat.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {tx.payments?.map((payment) => (
                  <div
                    key={payment.id}
                    style={{
                      borderBottom: "1px solid var(--color-border-light)",
                      paddingBottom: "var(--space-2)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--color-success)" }}>
                        +{formatCurrency(payment.amount)}
                      </span>
                      <span className="status-badge neutral" style={{ fontSize: "10px" }}>
                        {payment.paymentMethod}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                      <span>{payment.paymentType === "DP" ? "Uang Muka (DP)" : payment.paymentType === "FULL_PAYMENT" ? "Pelunasan penuh" : "Cicilan"}</span>
                      <span>{formatDateTime(payment.paymentDate)}</span>
                    </div>
                    {payment.notes && (
                      <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "4px", fontStyle: "italic" }}>
                        "{payment.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Catat Pembayaran"
        footer={
          <>
            <button onClick={() => setPaymentModalOpen(false)} className="btn btn-secondary" disabled={submitting}>
              Batal
            </button>
            <button onClick={handleRecordPayment} className="btn btn-primary" disabled={submitting}>
              {submitting ? "Memproses..." : "Simpan Pembayaran"}
            </button>
          </>
        }
      >
        <form onSubmit={handleRecordPayment} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div
            style={{
              background: "var(--color-bg-secondary)",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              marginBottom: "var(--space-2)",
            }}
          >
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Sisa Tagihan Maksimal:</span>
            <p style={{ fontWeight: 800, fontSize: "var(--text-lg)", fontFamily: "var(--font-mono)", color: "var(--color-danger)", marginTop: "2px" }}>
              {formatCurrency(tx.remainingAmount)}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pay-amount-input">
              Jumlah Uang (IDR) <span className="required">*</span>
            </label>
            <input
              id="pay-amount-input"
              type="number"
              className="form-input"
              placeholder="Contoh: 5000000"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
              required
              max={tx.remainingAmount}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pay-type-select">Tipe Pembayaran</label>
            <select
              id="pay-type-select"
              className="form-select"
              value={payType}
              onChange={(e) => setPayType(e.target.value as any)}
              disabled={submitting}
            >
              <option value="INSTALLMENT">Cicilan (Installment)</option>
              <option value="FULL_PAYMENT">Pelunasan Akhir (Full Payment)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pay-method-select">Metode Pembayaran</label>
            <select
              id="pay-method-select"
              className="form-select"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              disabled={submitting}
            >
              <option value="TRANSFER">Transfer Bank</option>
              <option value="CASH">Tunai (Cash)</option>
              <option value="QRIS">QRIS</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pay-notes-input">Catatan</label>
            <input
              id="pay-notes-input"
              type="text"
              className="form-input"
              placeholder="Keterangan transfer, nomor rekening, dll..."
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              disabled={submitting}
            />
          </div>
        </form>
      </Modal>

      {/* Cancel Transaction Dialog */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelTransaction}
        title="Batalkan Transaksi"
        message={`Apakah Anda yakin ingin membatalkan transaksi ${tx.invoiceNumber}? Status hewan kurban yang dibeli akan otomatis dikembalikan menjadi "Tersedia" agar dapat ditransaksikan kembali.`}
        isLoading={submitting}
      />
    </div>
  );
}
