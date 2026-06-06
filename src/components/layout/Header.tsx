"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const unread = json.data.filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
          }
        }
      } catch (err) {
        console.error("Failed to fetch notification count:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Dashboard";
    
    const root = parts[0];
    switch (root) {
      case "dashboard":
        return "Dashboard";
      case "animals":
        return "Manajemen Hewan";
      case "animal-types":
        return "Tipe Hewan";
      case "buyers":
        return "Data Pembeli";
      case "transactions":
        return "Transaksi Penjualan";
      case "deliveries":
        return "Pengiriman";
      case "reports":
        return "Laporan Keuangan";
      case "users":
        return "Kelola Pengguna";
      case "notifications":
        return "Notifikasi";
      case "settings":
        return "Pengaturan";
      default:
        return "KurbanKu";
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          onClick={onToggleSidebar}
          className="mobile-menu-btn"
          style={{ display: "flex" }}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="header-title" style={{ marginLeft: "12px", fontSize: "1.25rem" }}>
          {getPageTitle()}
        </h1>
      </div>

      <div className="header-right">
        <ThemeToggle />
        
        <Link href="/notifications" className="header-icon-btn" title="Notifikasi">
          <Bell />
          {unreadCount > 0 && <span className="header-notif-dot" />}
        </Link>
      </div>
    </header>
  );
}
