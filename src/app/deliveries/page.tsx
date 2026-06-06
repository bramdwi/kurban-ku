"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  Eye,
  Search,
  MapPin,
  Calendar,
  User as UserIcon,
  Package,
  CheckCircle2,
  Navigation,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/ui/DataTable";
import { Delivery } from "@/types";
import toast from "react-hot-toast";
import { formatCurrency, formatDate, formatDateTime, getStatusConfig } from "@/lib/utils";

export default function DeliveriesPage() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, status });
      const res = await fetch(`/api/deliveries?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setDeliveries(json.data);
      }
    } catch {
      toast.error("Gagal memuat data pengiriman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeliveries();
  };

  const handleStatusUpdate = async (deliveryId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Status diubah ke ${getStatusConfig(newStatus).label}`);
        fetchDeliveries();
      } else {
        toast.error(json.error || "Gagal mengubah status");
      }
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  // Stats summary
  const stats = {
    scheduled: deliveries.filter((d) => d.status === "SCHEDULED").length,
    inTransit: deliveries.filter((d) => d.status === "IN_TRANSIT").length,
    delivered: deliveries.filter((d) => d.status === "DELIVERED").length,
    failed: deliveries.filter((d) => d.status === "FAILED").length,
  };

  const getNextStatusActions = (currentStatus: string) => {
    switch (currentStatus) {
      case "SCHEDULED":
        return [
          { status: "IN_TRANSIT", label: "Mulai Kirim", icon: Navigation, variant: "btn-warning" },
        ];
      case "IN_TRANSIT":
        return [
          { status: "DELIVERED", label: "Selesai", icon: CheckCircle2, variant: "btn-success" },
          { status: "FAILED", label: "Gagal", icon: AlertCircle, variant: "btn-danger" },
        ];
      case "FAILED":
        return [
          { status: "SCHEDULED", label: "Jadwal Ulang", icon: Clock, variant: "btn-secondary" },
        ];
      default:
        return [];
    }
  };

  const columns = [
    {
      header: "Invoice",
      accessor: (row: Delivery) => (
        <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
          {(row as any).transaction?.invoiceNumber || "-"}
        </span>
      ),
    },
    {
      header: "Pembeli",
      accessor: (row: Delivery) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UserIcon size={14} style={{ color: "var(--color-text-muted)" }} />
          <span>{(row as any).transaction?.buyer?.name || "-"}</span>
        </div>
      ),
    },
    {
      header: "Alamat Pengiriman",
      accessor: (row: Delivery) => (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", maxWidth: "200px" }}>
          <MapPin size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0, marginTop: "2px" }} />
          <span style={{ fontSize: "var(--text-sm)", lineHeight: 1.4 }}>
            {row.deliveryAddress || "-"}
          </span>
        </div>
      ),
    },
    {
      header: "Jadwal",
      accessor: (row: Delivery) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-muted)" }}>
          <Calendar size={14} />
          <span style={{ fontSize: "var(--text-sm)" }}>
            {row.scheduledDate ? formatDate(row.scheduledDate) : "Belum dijadwalkan"}
          </span>
        </div>
      ),
    },
    {
      header: "Driver",
      accessor: (row: Delivery) => (
        <span style={{ fontSize: "var(--text-sm)" }}>
          {(row as any).driver?.name || (
            <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>Belum ditugaskan</span>
          )}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row: Delivery) => {
        const config = getStatusConfig(row.status);
        return <span className={`status-badge ${config.variant}`}>{config.label}</span>;
      },
    },
    {
      header: "Aksi",
      accessor: (row: Delivery) => {
        const actions = getNextStatusActions(row.status);
        return (
          <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap" }}>
            <Link
              href={`/deliveries/${row.id}`}
              className="btn btn-secondary btn-icon btn-sm"
              title="Detail"
            >
              <Eye size={14} />
            </Link>
            {actions.map((action) => (
              <button
                key={action.status}
                onClick={() => handleStatusUpdate(row.id, action.status)}
                className={`btn ${action.variant} btn-sm`}
                title={action.label}
                style={{ fontSize: "var(--text-xs)", padding: "4px 8px" }}
              >
                <action.icon size={12} />
                <span style={{ marginLeft: "4px" }}>{action.label}</span>
              </button>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Manajemen Pengiriman</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Pantau dan kelola proses pengiriman hewan kurban ke lokasi pembeli.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {[
          { label: "Terjadwal", value: stats.scheduled, icon: Clock, color: "var(--color-info)" },
          { label: "Dalam Perjalanan", value: stats.inTransit, icon: Navigation, color: "var(--color-warning)" },
          { label: "Terkirim", value: stats.delivered, icon: CheckCircle2, color: "var(--color-success)" },
          { label: "Gagal", value: stats.failed, icon: AlertCircle, color: "var(--color-danger)" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{
              padding: "var(--space-4)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-xl)",
                background: `${stat.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <stat.icon size={22} style={{ color: stat.color }} />
            </div>
            <div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
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
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="delivery-search">
              Cari Pengiriman
            </label>
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
                id="delivery-search"
                type="text"
                className="form-input"
                placeholder="Invoice, nama, alamat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="delivery-status-filter">
              Status
            </label>
            <select
              id="delivery-status-filter"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="SCHEDULED">Terjadwal</option>
              <option value="IN_TRANSIT">Dalam Perjalanan</option>
              <option value="DELIVERED">Terkirim</option>
              <option value="FAILED">Gagal</option>
            </select>
          </div>

          <div>
            <button type="submit" className="btn btn-secondary" style={{ width: "100%" }}>
              Cari
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <DataTable
          columns={columns}
          data={deliveries}
          loading={loading}
          emptyTitle="Tidak ada pengiriman"
          emptyDescription="Pengiriman akan otomatis dibuat saat transaksi baru dikonfirmasi."
        />
      </div>
    </div>
  );
}
