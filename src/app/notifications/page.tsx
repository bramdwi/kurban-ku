"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  CreditCard,
  ShoppingBag,
  Truck,
  Filter,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Notification } from "@/types";
import toast from "react-hot-toast";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  PAYMENT_REMINDER: { label: "Pengingat Pembayaran", icon: CreditCard, color: "var(--color-warning)" },
  PURCHASE_CONFIRMATION: { label: "Konfirmasi Pembelian", icon: ShoppingBag, color: "var(--color-success)" },
  DELIVERY_UPDATE: { label: "Update Pengiriman", icon: Truck, color: "var(--color-info)" },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showUnreadOnly) params.set("unreadOnly", "true");
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/notifications?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.notifications);
        setUnreadCount(json.data.unreadCount);
      }
    } catch {
      toast.error("Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, showUnreadOnly]);

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: ids }),
      });
      fetchNotifications();
    } catch {
      toast.error("Gagal menandai notifikasi");
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      toast.success("Semua notifikasi ditandai sudah dibaca");
      fetchNotifications();
    } catch {
      toast.error("Gagal menandai notifikasi");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Notifikasi</h2>
            {unreadCount > 0 && (
              <span
                style={{
                  background: "var(--color-danger)",
                  color: "#fff",
                  padding: "2px 10px",
                  borderRadius: "var(--radius-full, 9999px)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                }}
              >
                {unreadCount} baru
              </span>
            )}
          </div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Pantau notifikasi terkait transaksi, pembayaran, dan pengiriman.
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button onClick={fetchNotifications} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn btn-primary btn-sm">
              <CheckCheck size={14} /> Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
          {/* Type filter tabs */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-1)",
              background: "var(--color-bg-secondary)",
              padding: "3px",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <button
              onClick={() => setTypeFilter("")}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-md)",
                border: "none",
                cursor: "pointer",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                background: !typeFilter ? "var(--color-bg)" : "transparent",
                color: !typeFilter ? "var(--color-text)" : "var(--color-text-muted)",
                boxShadow: !typeFilter ? "var(--shadow-sm)" : "none",
                transition: "all 0.2s",
              }}
            >
              Semua
            </button>
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setTypeFilter(typeFilter === key ? "" : key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  background: typeFilter === key ? "var(--color-bg)" : "transparent",
                  color: typeFilter === key ? config.color : "var(--color-text-muted)",
                  boxShadow: typeFilter === key ? "var(--shadow-sm)" : "none",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {config.label}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
              }}
            >
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                style={{ accentColor: "var(--color-primary)" }}
              />
              Belum dibaca saja
            </label>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "var(--radius-xl)" }} />
            ))}
          </>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.PURCHASE_CONFIRMATION;
            const Icon = config.icon;
            return (
              <div
                key={notif.id}
                className="card"
                style={{
                  padding: "var(--space-4)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-4)",
                  borderLeft: !notif.isRead ? `4px solid ${config.color}` : "4px solid transparent",
                  background: !notif.isRead ? "var(--color-bg)" : "var(--color-bg-secondary)",
                  opacity: notif.isRead ? 0.7 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "var(--radius-xl)",
                    background: `${config.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} style={{ color: config.color }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", marginBottom: "2px" }}>
                        {notif.title}
                        {!notif.isRead && (
                          <span
                            style={{
                              display: "inline-block",
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: config.color,
                              marginLeft: "8px",
                              verticalAlign: "middle",
                            }}
                          />
                        )}
                      </div>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
                        {notif.message}
                      </p>
                      {(notif as any).transaction?.invoiceNumber && (
                        <Link
                          href={`/transactions/${notif.transactionId}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "var(--text-xs)",
                            color: "var(--color-primary)",
                            fontWeight: 600,
                            marginTop: "6px",
                            textDecoration: "none",
                          }}
                        >
                          <ExternalLink size={12} />
                          {(notif as any).transaction.invoiceNumber}
                        </Link>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead([notif.id])}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Tandai sudah dibaca"
                          style={{ padding: "4px" }}
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className="card"
            style={{
              padding: "var(--space-8)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <BellOff size={48} style={{ color: "var(--color-text-muted)", opacity: 0.5 }} />
            <h3 style={{ fontWeight: 700, color: "var(--color-text-muted)" }}>Tidak ada notifikasi</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
              {showUnreadOnly
                ? "Semua notifikasi sudah dibaca."
                : "Notifikasi akan muncul saat ada aktivitas transaksi, pembayaran, atau pengiriman."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
