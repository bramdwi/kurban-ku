"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Receipt, Search, Calendar, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/ui/DataTable";
import { Transaction } from "@/types";
import toast from "react-hot-toast";
import { formatCurrency, formatDateTime, getStatusConfig } from "@/lib/utils";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const canCreate = user?.role === "OWNER" || user?.role === "STAFF";

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status,
        paymentStatus,
      });
      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setTransactions(json.data);
      }
    } catch (err) {
      toast.error("Gagal memuat transaksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, paymentStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const columns = [
    {
      header: "Nomor Invoice",
      accessor: "invoiceNumber" as const,
      className: "font-heading font-bold",
    },
    {
      header: "Tanggal Transaksi",
      accessor: (row: Transaction) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-muted)" }}>
          <Calendar size={14} />
          <span>{formatDateTime(row.transactionDate)}</span>
        </div>
      ),
    },
    {
      header: "Pembeli",
      accessor: (row: Transaction) => row.buyer?.name || "-",
    },
    {
      header: "Total Nilai",
      accessor: (row: Transaction) => formatCurrency(row.totalAmount),
      className: "font-mono font-bold",
    },
    {
      header: "Status Pembayaran",
      accessor: (row: Transaction) => {
        const config = getStatusConfig(row.paymentStatus);
        return <span className={`status-badge ${config.variant}`}>{config.label}</span>;
      },
    },
    {
      header: "Status Transaksi",
      accessor: (row: Transaction) => {
        const config = getStatusConfig(row.status);
        return <span className={`status-badge ${config.variant}`}>{config.label}</span>;
      },
    },
    {
      header: "Aksi",
      accessor: (row: Transaction) => (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Link
            href={`/transactions/${row.id}`}
            className="btn btn-secondary btn-icon btn-sm"
            title="Lihat Detail"
          >
            <Eye size={14} />
          </Link>
          <Link
            href={`/transactions/${row.id}/invoice`}
            className="btn btn-secondary btn-icon btn-sm"
            title="Cetak Invoice"
          >
            <FileText size={14} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Transaksi Penjualan</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Kelola faktur, pembayaran DP, cicilan, pelunasan, dan pembatalan transaksi hewan kurban.
          </p>
        </div>
        {canCreate && (
          <Link href="/transactions/new" className="btn btn-primary">
            <Plus size={18} />
            Buat Transaksi Baru
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-3)",
            alignItems: "end",
          }}
        >
          {/* Invoice/Buyer search */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="search-input">Cari Transaksi</label>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-muted)",
                }}
              />
              <input
                id="search-input"
                type="text"
                className="form-input"
                placeholder="No. Invoice atau Nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </div>
          </div>

          {/* Payment Status Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="payment-status-filter">Status Pembayaran</label>
            <select
              id="payment-status-filter"
              className="form-select"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="">Semua Pembayaran</option>
              <option value="UNPAID">Belum Bayar</option>
              <option value="DP_PAID">DP Dibayar</option>
              <option value="FULLY_PAID">Lunas</option>
            </select>
          </div>

          {/* Transaction Status Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="status-filter">Status Transaksi</label>
            <select
              id="status-filter"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Semua Transaksi</option>
              <option value="PENDING">Menunggu</option>
              <option value="CONFIRMED">Dikonfirmasi</option>
              <option value="DELIVERED">Terkirim</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          <div>
            <button type="submit" className="btn btn-secondary" style={{ width: "100%" }}>
              Cari Transaksi
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <DataTable
          columns={columns}
          data={transactions}
          loading={loading}
          emptyTitle="Tidak ada transaksi"
          emptyDescription="Silakan buat transaksi baru atau sesuaikan filter pencarian Anda."
        />
      </div>
    </div>
  );
}
