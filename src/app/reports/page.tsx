"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Truck,
  Package,
  Users,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { formatCurrency, formatNumber, getSpeciesLabel, getStatusConfig } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/export";

type ReportType = "financial" | "sales" | "animal" | "delivery";

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ReportType>("financial");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: activeTab });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await fetch(`/api/reports?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast.error(json.error || "Gagal memuat laporan");
      }
    } catch {
      toast.error("Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { key: "financial" as const, label: "Keuangan", icon: DollarSign },
    { key: "sales" as const, label: "Penjualan", icon: BarChart3 },
    { key: "animal" as const, label: "Stok Hewan", icon: Package },
    { key: "delivery" as const, label: "Pengiriman", icon: Truck },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Laporan & Analisis</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Laporan keuangan, penjualan, stok hewan, dan pengiriman secara real-time.
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button onClick={fetchReport} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => exportToPDF(activeTab, data)} className="btn btn-secondary btn-sm" disabled={!data || loading}>
            <Download size={14} /> PDF
          </button>
          <button onClick={() => exportToExcel(activeTab, data)} className="btn btn-secondary btn-sm" disabled={!data || loading}>
            <Download size={14} /> Excel
          </button>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm">
            <Printer size={14} /> Cetak
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-1)",
          background: "var(--color-bg-secondary)",
          padding: "4px",
          borderRadius: "var(--radius-xl)",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "var(--radius-lg)",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
              background: activeTab === tab.key ? "var(--color-bg)" : "transparent",
              color: activeTab === tab.key ? "var(--color-primary)" : "var(--color-text-muted)",
              boxShadow: activeTab === tab.key ? "var(--shadow-sm)" : "none",
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Filter */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "end",
            gap: "var(--space-3)",
            flexWrap: "wrap",
          }}
        >
          <div className="form-group" style={{ marginBottom: 0, minWidth: "180px" }}>
            <label className="form-label" htmlFor="report-start-date">
              <Calendar size={14} style={{ display: "inline", marginRight: "4px", verticalAlign: "text-bottom" }} />
              Dari Tanggal
            </label>
            <input
              id="report-start-date"
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: "180px" }}>
            <label className="form-label" htmlFor="report-end-date">
              Sampai Tanggal
            </label>
            <input
              id="report-end-date"
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button onClick={fetchReport} className="btn btn-primary btn-sm">
            Terapkan Filter
          </button>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className="btn btn-ghost btn-sm"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-4)" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: "160px", borderRadius: "var(--radius-xl)" }} />
          ))}
        </div>
      ) : data ? (
        <>
          {activeTab === "financial" && <FinancialReport data={data} />}
          {activeTab === "sales" && <SalesReport data={data} />}
          {activeTab === "animal" && <AnimalReport data={data} />}
          {activeTab === "delivery" && <DeliveryReport data={data} />}
        </>
      ) : null}
    </div>
  );
}

// ===== FINANCIAL REPORT =====
function FinancialReport({ data }: { data: any }) {
  const profitIsPositive = data.netProfit >= 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
        <StatCard
          label="Total Pendapatan"
          value={formatCurrency(data.totalRevenue)}
          icon={<DollarSign size={22} />}
          color="var(--color-primary)"
          description={`${data.totalTransactions} transaksi`}
        />
        <StatCard
          label="Terbayar"
          value={formatCurrency(data.totalPaid)}
          icon={<CheckCircle size={22} />}
          color="var(--color-success)"
          description={`${data.paidTransactions} lunas`}
        />
        <StatCard
          label="Sisa Hutang"
          value={formatCurrency(data.totalDebt)}
          icon={<AlertTriangle size={22} />}
          color="var(--color-warning)"
          description={`${data.dpTransactions} DP + ${data.unpaidTransactions} belum bayar`}
        />
        <StatCard
          label="Laba Bersih"
          value={formatCurrency(data.netProfit)}
          icon={profitIsPositive ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
          color={profitIsPositive ? "var(--color-success)" : "var(--color-danger)"}
          description={`Modal: ${formatCurrency(data.totalPurchaseCost)}`}
        />
      </div>

      {/* Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        {/* Financial Summary */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            Ringkasan Keuangan
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <FinancialRow label="Total Pendapatan" value={data.totalRevenue} color="var(--color-text)" />
            <FinancialRow label="Total Modal Pembelian" value={-data.totalPurchaseCost} color="var(--color-danger)" />
            <hr style={{ border: "none", borderTop: "1px dashed var(--color-border)", margin: "var(--space-1) 0" }} />
            <FinancialRow label="Laba Kotor" value={data.grossProfit} color="var(--color-success)" bold />
            <FinancialRow label="Biaya Operasional" value={-data.totalExpenses} color="var(--color-danger)" />
            <hr style={{ border: "none", borderTop: "2px solid var(--color-border)", margin: "var(--space-1) 0" }} />
            <FinancialRow label="Laba Bersih" value={data.netProfit} color={profitIsPositive ? "var(--color-success)" : "var(--color-danger)"} bold large />
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            Breakdown Bulanan
          </h3>
          {data.monthlyBreakdown?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {data.monthlyBreakdown.map((m: any) => (
                <div
                  key={m.month}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--space-3)",
                    background: "var(--color-bg-secondary)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{m.month}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                      {m.count} transaksi
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      {formatCurrency(m.revenue)}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: m.profit >= 0 ? "var(--color-success)" : "var(--color-danger)",
                        fontWeight: 600,
                      }}
                    >
                      {m.profit >= 0 ? "+" : ""}{formatCurrency(m.profit)} laba
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "var(--space-6)" }}>
              Tidak ada data bulanan
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== SALES REPORT =====
function SalesReport({ data }: { data: any }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
        <StatCard
          label="Total Transaksi"
          value={formatNumber(data.totalTransactions)}
          icon={<Receipt size={22} />}
          color="var(--color-primary)"
        />
        <StatCard
          label="Hewan Terjual"
          value={formatNumber(data.totalAnimals)}
          icon={<Package size={22} />}
          color="var(--color-info)"
        />
        <StatCard
          label="Total Penjualan"
          value={formatCurrency(data.totalRevenue)}
          icon={<DollarSign size={22} />}
          color="var(--color-success)"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        {/* Species Breakdown */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            Penjualan per Jenis Hewan
          </h3>
          {data.speciesBreakdown?.map((sp: any) => {
            const pct = data.totalAnimals > 0 ? Math.round((sp.count / data.totalAnimals) * 100) : 0;
            const colors: Record<string, string> = {
              SAPI: "var(--color-primary)",
              KAMBING: "var(--color-success)",
              DOMBA: "var(--color-warning)",
            };
            return (
              <div key={sp.species} style={{ marginBottom: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 600 }}>{getSpeciesLabel(sp.species)}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    {sp.count} ekor ({pct}%)
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "var(--color-bg-tertiary)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: colors[sp.species] || "var(--color-primary)",
                      borderRadius: "4px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  Revenue: {formatCurrency(sp.revenue)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Buyers */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            Top 10 Pembeli
          </h3>
          {data.topBuyers?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {data.topBuyers.map((buyer: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-3)",
                    background: "var(--color-bg-secondary)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: idx < 3 ? "var(--color-primary)" : "var(--color-bg-tertiary)",
                      color: idx < 3 ? "#fff" : "var(--color-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "var(--text-sm)",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {buyer.name}
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                      {buyer.count} transaksi
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>
                    {formatCurrency(buyer.totalSpent)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "var(--space-6)" }}>
              Belum ada data pembeli
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== ANIMAL REPORT =====
function AnimalReport({ data }: { data: any }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Status Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-4)" }}>
        {[
          { label: "Tersedia", value: data.statusCounts?.AVAILABLE || 0, color: "var(--color-success)", icon: <CheckCircle size={22} /> },
          { label: "Dipesan", value: data.statusCounts?.BOOKED || 0, color: "var(--color-warning)", icon: <Clock size={22} /> },
          { label: "Terjual", value: data.statusCounts?.SOLD || 0, color: "var(--color-info)", icon: <Receipt size={22} /> },
          { label: "Mati", value: data.statusCounts?.DEAD || 0, color: "var(--color-danger)", icon: <AlertTriangle size={22} /> },
        ].map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={formatNumber(stat.value)} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        {/* Species Stock */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            Stok per Jenis Hewan
          </h3>
          {data.speciesStock?.map((sp: any) => (
            <div
              key={sp.species}
              style={{
                padding: "var(--space-4)",
                background: "var(--color-bg-secondary)",
                borderRadius: "var(--radius-lg)",
                marginBottom: "var(--space-3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                <span style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>{getSpeciesLabel(sp.species)}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{sp.total} ekor</span>
              </div>
              <div style={{ display: "flex", gap: "var(--space-4)", fontSize: "var(--text-sm)" }}>
                <span style={{ color: "var(--color-success)" }}>✓ Tersedia: {sp.available}</span>
                <span style={{ color: "var(--color-info)" }}>○ Terjual: {sp.sold}</span>
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
                Nilai jual: {formatCurrency(sp.totalValue)}
              </div>
            </div>
          ))}
        </div>

        {/* Valuation & Average Weight */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
              Valuasi Stok Tersedia
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <FinancialRow label="Harga Jual (total)" value={data.totalStockValue} color="var(--color-primary)" />
              <FinancialRow label="Harga Modal (total)" value={data.totalPurchaseValue} color="var(--color-text-muted)" />
              <hr style={{ border: "none", borderTop: "1px dashed var(--color-border)" }} />
              <FinancialRow label="Potensi Keuntungan" value={data.totalStockValue - data.totalPurchaseValue} color="var(--color-success)" bold />
            </div>
          </div>

          <div className="card" style={{ padding: "var(--space-5)" }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
              Rata-rata Berat
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {["SAPI", "KAMBING", "DOMBA"].map((sp) => (
                <div key={sp} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{getSpeciesLabel(sp as any)}</span>
                  <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {data.avgWeight?.[sp] || 0} kg
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== DELIVERY REPORT =====
function DeliveryReport({ data }: { data: any }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
        <StatCard
          label="Total Pengiriman"
          value={formatNumber(data.totalDeliveries)}
          icon={<Truck size={22} />}
          color="var(--color-primary)"
        />
        <StatCard
          label="Tingkat Keberhasilan"
          value={`${data.successRate}%`}
          icon={<TrendingUp size={22} />}
          color="var(--color-success)"
          description={`${data.statusCounts?.DELIVERED || 0} berhasil`}
        />
        <StatCard
          label="Dalam Proses"
          value={formatNumber((data.statusCounts?.SCHEDULED || 0) + (data.statusCounts?.IN_TRANSIT || 0))}
          icon={<Clock size={22} />}
          color="var(--color-warning)"
          description={`${data.statusCounts?.SCHEDULED || 0} terjadwal, ${data.statusCounts?.IN_TRANSIT || 0} transit`}
        />
        <StatCard
          label="Gagal"
          value={formatNumber(data.statusCounts?.FAILED || 0)}
          icon={<AlertTriangle size={22} />}
          color="var(--color-danger)"
        />
      </div>

      {/* Driver Performance */}
      <div className="card" style={{ padding: "var(--space-5)" }}>
        <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
          Performa Driver
        </h3>
        {data.driverPerformance?.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Driver", "Total Tugas", "Berhasil", "Gagal", "Tingkat Sukses"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "var(--space-3) var(--space-4)",
                        fontSize: "var(--text-xs)",
                        textTransform: "uppercase",
                        color: "var(--color-text-muted)",
                        borderBottom: "2px solid var(--color-border)",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.driverPerformance.map((d: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ padding: "var(--space-3) var(--space-4)", fontWeight: 600, borderBottom: "1px solid var(--color-border)" }}>
                      {d.name}
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", fontFamily: "var(--font-mono)", borderBottom: "1px solid var(--color-border)" }}>
                      {d.total}
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--color-success)", fontWeight: 600, borderBottom: "1px solid var(--color-border)" }}>
                      {d.delivered}
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--color-danger)", fontWeight: 600, borderBottom: "1px solid var(--color-border)" }}>
                      {d.failed}
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", fontWeight: 700, borderBottom: "1px solid var(--color-border)" }}>
                      {d.total > 0 ? Math.round((d.delivered / d.total) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "var(--space-6)" }}>
            Belum ada data driver
          </p>
        )}
      </div>
    </div>
  );
}

// ===== SHARED COMPONENTS =====
function StatCard({
  label,
  value,
  icon,
  color,
  description,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}) {
  return (
    <div
      className="card"
      style={{
        padding: "var(--space-5)",
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "var(--radius-xl)",
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
          {label}
        </div>
        <div style={{ fontSize: "var(--text-xl)", fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
        {description && (
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

function FinancialRow({
  label,
  value,
  color,
  bold,
  large,
}: {
  label: string;
  value: number;
  color: string;
  bold?: boolean;
  large?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontWeight: bold ? 700 : 400, fontSize: large ? "var(--text-base)" : "var(--text-sm)" }}>
        {label}
      </span>
      <span
        style={{
          fontWeight: bold ? 800 : 600,
          fontFamily: "var(--font-mono)",
          color,
          fontSize: large ? "var(--text-lg)" : "var(--text-sm)",
        }}
      >
        {value >= 0 ? "" : "-"}{formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}
