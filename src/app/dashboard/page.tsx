"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Beef,
  ShoppingBag,
  Banknote,
  TrendingUp,
  AlertCircle,
  FileText,
  Calendar,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import { DashboardStats } from "@/types";
import { formatCurrency, formatDateTime, getStatusConfig } from "@/lib/utils";
import Link from "next/link";
import Skeleton from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setStats(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Skeleton height="32px" width="250px" />
          <Skeleton height="18px" width="400px" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-5)" }}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} height="120px" />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
          <Skeleton height="350px" />
          <Skeleton height="350px" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Welcome Greeting */}
      <div>
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>
          Assalamu'alaikum, {user?.name}
        </h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
          Berikut adalah ringkasan performa penjualan hewan kurban saat ini.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-5)",
        }}
      >
        <StatCard
          label="Hewan Tersedia"
          value={stats.availableAnimals}
          icon={<Beef />}
          variant="accent"
        />
        <StatCard
          label="Hewan Dipesan (DP)"
          value={stats.bookedAnimals}
          icon={<ShoppingBag />}
          variant="warning"
        />
        <StatCard
          label="Hewan Terjual"
          value={stats.soldAnimals}
          icon={<Beef />}
          variant="success"
        />
        <StatCard
          label="Total Omzet"
          value={formatCurrency(stats.totalRevenue)}
          icon={<Banknote />}
          variant="info"
        />
        <StatCard
          label="Estimasi Keuntungan"
          value={formatCurrency(stats.totalProfit)}
          icon={<TrendingUp />}
          variant="success"
        />
        <StatCard
          label="Total Piutang (Sisa DP)"
          value={formatCurrency(stats.totalDebt)}
          icon={<AlertCircle />}
          variant="danger"
        />
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts monthlyData={stats.monthlyRevenue} />

      {/* Recent Transactions Section */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: "var(--space-4)" }}>
          <div>
            <h3 className="card-title">Transaksi Penjualan Terbaru</h3>
            <p className="card-subtitle">Lima transaksi penjualan hewan kurban terakhir</p>
          </div>
          <Link href="/transactions" className="btn btn-secondary btn-sm">
            Lihat Semua Transaksi
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "var(--text-sm)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-secondary)", fontWeight: 600 }}>
                <th style={{ padding: "var(--space-3) var(--space-4)" }}>Nomor Invoice</th>
                <th style={{ padding: "var(--space-3) var(--space-4)" }}>Tanggal</th>
                <th style={{ padding: "var(--space-3) var(--space-4)" }}>Pembeli</th>
                <th style={{ padding: "var(--space-3) var(--space-4)" }}>Total Nilai</th>
                <th style={{ padding: "var(--space-3) var(--space-4)" }}>Status Pembayaran</th>
                <th style={{ padding: "var(--space-3) var(--space-4)" }}>Status Transaksi</th>
                <th style={{ padding: "var(--space-3) var(--space-4)", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions.map((tx) => {
                const payStatus = getStatusConfig(tx.paymentStatus);
                const txStatus = getStatusConfig(tx.status);
                return (
                  <tr key={tx.id} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                    <td style={{ padding: "var(--space-3) var(--space-4)", fontWeight: 600 }}>
                      {tx.invoiceNumber}
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--color-text-muted)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={14} />
                        {formatDateTime(tx.transactionDate)}
                      </div>
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                      {tx.buyer?.name}
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      {formatCurrency(tx.totalAmount)}
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                      <span className={`status-badge ${payStatus.variant}`}>
                        {payStatus.label}
                      </span>
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                      <span className={`status-badge ${txStatus.variant}`}>
                        {txStatus.label}
                      </span>
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "center" }}>
                      <Link
                        href={`/transactions/${tx.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "4px 8px" }}
                      >
                        <FileText size={14} />
                        Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
