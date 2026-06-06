"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Transaction } from "@/types";
import { formatCurrency, formatDate, getSpeciesLabel, getStatusConfig } from "@/lib/utils";
import toast from "react-hot-toast";
import Skeleton from "@/components/ui/Skeleton";

export default function InvoicePrintPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await fetch(`/api/transactions/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setTx(json.data);
          } else {
            toast.error("Transaksi tidak ditemukan");
            router.push("/transactions");
          }
        }
      } catch (err) {
        toast.error("Gagal memuat invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchTx();
  }, [id, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: "var(--space-6)" }}>
        <Skeleton height="40px" width="200px" style={{ marginBottom: "20px" }} />
        <Skeleton height="500px" />
      </div>
    );
  }

  if (!tx) return null;

  const statusPay = getStatusConfig(tx.paymentStatus);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "800px", margin: "0 auto", paddingBottom: "var(--space-12)" }}>
      {/* Back & Print actions */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => router.back()} className="btn btn-secondary">
          <ArrowLeft size={16} />
          Kembali
        </button>
        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={16} />
          Cetak Faktur (Print)
        </button>
      </div>

      {/* Invoice Sheet container */}
      <div
        className="card"
        style={{
          background: "white",
          color: "#1a1a1a",
          padding: "var(--space-8)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-md)",
          border: "1px solid var(--color-border)",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Invoice Header */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #e5e7eb", paddingBottom: "var(--space-5)" }}>
          <div>
            <h1 style={{ color: "var(--color-accent-dark)", fontWeight: 800, fontSize: "1.75rem", fontFamily: "var(--font-heading)" }}>
              KurbanKu
            </h1>
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
              Pusat Penjualan Hewan Kurban Berkualitas<br />
              Jl. Raya Kandang Indah No. 99, Bandung<br />
              Telp: 0812-3456-7890 | email: info@kurbanku.com
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#374151" }}>
              Faktur Penjualan
            </h2>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>
              {tx.invoiceNumber}
            </p>
            <div style={{ marginTop: "12px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  background: tx.paymentStatus === "FULLY_PAID" ? "#d1fae5" : "#fef3c7",
                  color: tx.paymentStatus === "FULLY_PAID" ? "#065f46" : "#92400e",
                  border: "1px solid transparent",
                }}
              >
                {statusPay.label}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Tx details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", margin: "var(--space-6) 0" }}>
          <div>
            <h3 style={{ fontSize: "11px", textTransform: "uppercase", color: "#9ca3af", fontWeight: 700, marginBottom: "4px" }}>
              Ditujukan Kepada:
            </h3>
            <p style={{ fontWeight: 700, fontSize: "15px" }}>{tx.buyer?.name}</p>
            {tx.buyer?.phone && <p style={{ fontSize: "13px", color: "#4b5563", marginTop: "2px" }}>Telp: {tx.buyer.phone}</p>}
            {tx.buyer?.address && (
              <p style={{ fontSize: "12px", color: "#4b5563", marginTop: "4px", whiteSpace: "pre-line", lineHeight: 1.4 }}>
                {tx.buyer.address}
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ fontSize: "11px", textTransform: "uppercase", color: "#9ca3af", fontWeight: 700, marginBottom: "4px" }}>
              Rincian Tanggal:
            </h3>
            <p style={{ fontSize: "13px", color: "#374151" }}>
              <strong>Tanggal Transaksi:</strong> {formatDate(tx.transactionDate)}
            </p>
            <p style={{ fontSize: "13px", color: "#374151", marginTop: "4px" }}>
              <strong>Metode Bayar Awal:</strong> Cash / Transfer
            </p>
            <p style={{ fontSize: "13px", color: "#374151", marginTop: "4px" }}>
              <strong>Kasir / Staff:</strong> {tx.creator?.name}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", margin: "var(--space-6) 0", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #374151", background: "#f9fafb", color: "#374151", fontWeight: 700 }}>
              <th style={{ padding: "8px 12px" }}>No.</th>
              <th style={{ padding: "8px 12px" }}>Kode Hewan</th>
              <th style={{ padding: "8px 12px" }}>Spesifikasi Hewan</th>
              <th style={{ padding: "8px 12px", textAlign: "right" }}>Bobot (kg)</th>
              <th style={{ padding: "8px 12px", textAlign: "right" }}>Harga Satuan</th>
            </tr>
          </thead>
          <tbody>
            {tx.items?.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "10px 12px" }}>{idx + 1}.</td>
                <td style={{ padding: "10px 12px", fontWeight: 700 }}>{item.animal?.code}</td>
                <td style={{ padding: "10px 12px" }}>
                  {item.animal ? `${getSpeciesLabel(item.animal.species)} - Kelas ${item.animal.animalType?.typeName || "Standard"}` : "-"}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--font-mono)" }}>
                  {item.animal?.weight} kg
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  {formatCurrency(item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Sheet calculations */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-6)" }}>
          <div style={{ width: "300px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4b5563" }}>Total Tagihan:</span>
              <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{formatCurrency(tx.totalAmount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4b5563" }}>Total Dibayar:</span>
              <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#059669" }}>{formatCurrency(tx.paidAmount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #374151", paddingTop: "8px", fontWeight: 800, fontSize: "14px" }}>
              <span>Sisa Tagihan:</span>
              <span style={{ fontFamily: "var(--font-mono)", color: tx.remainingAmount > 0 ? "#dc2626" : "#059669" }}>
                {formatCurrency(tx.remainingAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div style={{ marginTop: "var(--space-12)", borderTop: "1px dashed #d1d5db", paddingTop: "var(--space-4)", fontSize: "11px", color: "#6b7280", textAlign: "center", lineHeight: 1.4 }}>
          <p>Terima kasih telah mempercayakan ibadah kurban Anda kepada kami.</p>
          <p style={{ marginTop: "4px" }}>Kwitansi ini sah sebagai bukti transaksi pembayaran hewan kurban KurbanKu.</p>
        </div>
      </div>
    </div>
  );
}
