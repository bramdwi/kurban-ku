"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Calendar,
  User as UserIcon,
  Package,
  CheckCircle2,
  Navigation,
  AlertCircle,
  Clock,
  Phone,
  FileText,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Delivery, User } from "@/types";
import toast from "react-hot-toast";
import { formatCurrency, formatDate, formatDateTime, getStatusConfig, getSpeciesLabel } from "@/lib/utils";

export default function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [drivers, setDrivers] = useState<User[]>([]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    driverId: "",
    scheduledDate: "",
    deliveryAddress: "",
    notes: "",
  });

  const fetchDelivery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/deliveries/${id}`);
      const json = await res.json();
      if (json.success) {
        setDelivery(json.data);
        setEditForm({
          driverId: json.data.driverId || "",
          scheduledDate: json.data.scheduledDate
            ? new Date(json.data.scheduledDate).toISOString().split("T")[0]
            : "",
          deliveryAddress: json.data.deliveryAddress || "",
          notes: json.data.notes || "",
        });
      } else {
        toast.error("Pengiriman tidak ditemukan");
        router.push("/deliveries");
      }
    } catch {
      toast.error("Gagal memuat data pengiriman");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch("/api/users?role=DRIVER");
      const json = await res.json();
      if (json.success) setDrivers(json.data);
    } catch {
      // Drivers might not be loaded
    }
  };

  useEffect(() => {
    fetchDelivery();
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/deliveries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Status diubah ke ${getStatusConfig(newStatus).label}`);
        fetchDelivery();
      } else {
        toast.error(json.error || "Gagal mengubah status");
      }
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/deliveries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Data pengiriman berhasil diperbarui");
        setEditing(false);
        fetchDelivery();
      } else {
        toast.error(json.error || "Gagal menyimpan");
      }
    } catch {
      toast.error("Gagal menyimpan");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div className="skeleton" style={{ height: "40px", width: "300px" }} />
        <div className="skeleton" style={{ height: "200px" }} />
        <div className="skeleton" style={{ height: "300px" }} />
      </div>
    );
  }

  if (!delivery) return null;

  const txn = delivery.transaction as any;
  const statusConfig = getStatusConfig(delivery.status);

  const getTimelineSteps = () => {
    const steps = [
      {
        status: "SCHEDULED",
        label: "Terjadwal",
        icon: Clock,
        time: delivery.createdAt,
        active: true,
      },
      {
        status: "IN_TRANSIT",
        label: "Dalam Perjalanan",
        icon: Navigation,
        time: delivery.status === "IN_TRANSIT" || delivery.status === "DELIVERED" ? delivery.updatedAt : null,
        active: delivery.status === "IN_TRANSIT" || delivery.status === "DELIVERED",
      },
      {
        status: "DELIVERED",
        label: "Terkirim",
        icon: CheckCircle2,
        time: delivery.deliveredAt,
        active: delivery.status === "DELIVERED",
      },
    ];
    return steps;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Link href="/deliveries" className="btn btn-ghost btn-icon">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>
              Detail Pengiriman
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
              Invoice: {txn?.invoiceNumber}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <span className={`status-badge ${statusConfig.variant}`} style={{ fontSize: "var(--text-base)", padding: "6px 16px" }}>
            {statusConfig.label}
          </span>
          {delivery.status === "SCHEDULED" && (
            <button onClick={() => handleStatusUpdate("IN_TRANSIT")} className="btn btn-warning btn-sm">
              <Navigation size={14} /> Mulai Kirim
            </button>
          )}
          {delivery.status === "IN_TRANSIT" && (
            <>
              <button onClick={() => handleStatusUpdate("DELIVERED")} className="btn btn-success btn-sm">
                <CheckCircle2 size={14} /> Selesai
              </button>
              <button onClick={() => handleStatusUpdate("FAILED")} className="btn btn-danger btn-sm">
                <AlertCircle size={14} /> Gagal
              </button>
            </>
          )}
          {delivery.status === "FAILED" && (
            <button onClick={() => handleStatusUpdate("SCHEDULED")} className="btn btn-secondary btn-sm">
              <Clock size={14} /> Jadwal Ulang
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{ padding: "var(--space-5)" }}>
        <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
          Timeline Pengiriman
        </h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "relative",
            padding: "0 var(--space-4)",
          }}
        >
          {/* Progress bar background */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "calc(16.67%)",
              right: "calc(16.67%)",
              height: "3px",
              background: "var(--color-border)",
              borderRadius: "2px",
            }}
          />
          {/* Active progress bar */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "calc(16.67%)",
              width:
                delivery.status === "DELIVERED"
                  ? "calc(66.67%)"
                  : delivery.status === "IN_TRANSIT"
                  ? "calc(33.33%)"
                  : "0%",
              height: "3px",
              background: "var(--color-primary)",
              borderRadius: "2px",
              transition: "width 0.5s ease",
            }}
          />
          {getTimelineSteps().map((step, idx) => (
            <div
              key={step.status}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--space-2)",
                zIndex: 1,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: step.active
                    ? delivery.status === step.status
                      ? "var(--color-primary)"
                      : "var(--color-success)"
                    : "var(--color-bg-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: step.active ? "3px solid transparent" : "3px solid var(--color-border)",
                  boxShadow: step.active ? "0 0 0 4px rgba(var(--color-primary-rgb, 99, 102, 241), 0.2)" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                <step.icon
                  size={20}
                  style={{
                    color: step.active ? "#fff" : "var(--color-text-muted)",
                  }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{step.label}</div>
                {step.time && step.active && (
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                    {formatDateTime(step.time)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {delivery.status === "FAILED" && (
          <div
            style={{
              marginTop: "var(--space-4)",
              padding: "var(--space-3)",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "var(--radius-lg)",
              color: "var(--color-danger)",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            <AlertCircle size={16} style={{ display: "inline", marginRight: "8px", verticalAlign: "text-bottom" }} />
            Pengiriman gagal. Silakan jadwalkan ulang.
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        {/* Delivery Details */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Info Pengiriman</h3>
            {!editing && delivery.status !== "DELIVERED" && (
              <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm">
                <Edit3 size={14} /> Edit
              </button>
            )}
            {editing && (
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button onClick={handleSaveEdit} className="btn btn-primary btn-sm">
                  <Save size={14} /> Simpan
                </button>
                <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {/* Driver */}
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Driver
              </div>
              {editing ? (
                <select
                  className="form-select"
                  value={editForm.driverId}
                  onChange={(e) => setEditForm({ ...editForm, driverId: e.target.value })}
                >
                  <option value="">Pilih Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <UserIcon size={16} style={{ color: "var(--color-text-muted)" }} />
                  <span style={{ fontWeight: 600 }}>
                    {(delivery as any).driver?.name || "Belum ditugaskan"}
                  </span>
                </div>
              )}
            </div>

            {/* Schedule */}
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tanggal Jadwal
              </div>
              {editing ? (
                <input
                  type="date"
                  className="form-input"
                  value={editForm.scheduledDate}
                  onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={16} style={{ color: "var(--color-text-muted)" }} />
                  <span style={{ fontWeight: 600 }}>
                    {delivery.scheduledDate ? formatDate(delivery.scheduledDate) : "Belum dijadwalkan"}
                  </span>
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Alamat Pengiriman
              </div>
              {editing ? (
                <textarea
                  className="form-input"
                  rows={3}
                  value={editForm.deliveryAddress}
                  onChange={(e) => setEditForm({ ...editForm, deliveryAddress: e.target.value })}
                  placeholder="Masukkan alamat pengiriman"
                />
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <MapPin size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0, marginTop: "2px" }} />
                  <span>{delivery.deliveryAddress || "Tidak ada alamat"}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Catatan
              </div>
              {editing ? (
                <textarea
                  className="form-input"
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Catatan pengiriman"
                />
              ) : (
                <p style={{ color: delivery.notes ? "var(--color-text)" : "var(--color-text-muted)", fontStyle: delivery.notes ? "normal" : "italic" }}>
                  {delivery.notes || "Tidak ada catatan"}
                </p>
              )}
            </div>

            {/* Delivered At */}
            {delivery.deliveredAt && (
              <div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Waktu Terkirim
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-success)" }}>
                  <CheckCircle2 size={16} />
                  <span style={{ fontWeight: 600 }}>{formatDateTime(delivery.deliveredAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buyer Info */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            Info Pembeli
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "var(--text-lg)",
                }}
              >
                {txn?.buyer?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>{txn?.buyer?.name}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                  Pelanggan
                </div>
              </div>
            </div>
            {txn?.buyer?.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Phone size={14} style={{ color: "var(--color-text-muted)" }} />
                <span>{txn.buyer.phone}</span>
              </div>
            )}
            {txn?.buyer?.address && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <MapPin size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0, marginTop: "2px" }} />
                <span>{txn.buyer.address}</span>
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "var(--space-2) 0" }} />

            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Transaksi
              </div>
              <div style={{ fontWeight: 800, fontSize: "var(--text-lg)", fontFamily: "var(--font-mono)" }}>
                {formatCurrency(txn?.totalAmount || 0)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Status Pembayaran
              </div>
              <span className={`status-badge ${getStatusConfig(txn?.paymentStatus || "UNPAID").variant}`}>
                {getStatusConfig(txn?.paymentStatus || "UNPAID").label}
              </span>
            </div>

            <Link href={`/transactions/${txn?.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: "var(--space-2)" }}>
              <FileText size={14} /> Lihat Transaksi
            </Link>
          </div>
        </div>
      </div>

      {/* Animals in this delivery */}
      <div className="card" style={{ padding: "var(--space-5)" }}>
        <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
          Hewan yang Dikirim ({txn?.items?.length || 0} ekor)
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {txn?.items?.map((item: any) => (
            <div
              key={item.id}
              style={{
                padding: "var(--space-4)",
                background: "var(--color-bg-secondary)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-primary-light, rgba(99, 102, 241, 0.1))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Package size={20} style={{ color: "var(--color-primary)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{item.animal?.code}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                  {getSpeciesLabel(item.animal?.species)} • {item.animal?.weight} kg
                </div>
              </div>
              <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>
                {formatCurrency(item.price)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
