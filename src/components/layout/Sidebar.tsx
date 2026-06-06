"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Beef,
  Tags,
  Users,
  Receipt,
  Truck,
  BarChart3,
  UserCog,
  Bell,
  LogOut,
  Settings,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["OWNER", "STAFF", "DRIVER"] },
    { href: "/animals", label: "Hewan Kurban", icon: Beef, roles: ["OWNER", "STAFF", "DRIVER"] },
    { href: "/animal-types", label: "Tipe Hewan", icon: Tags, roles: ["OWNER", "STAFF"] },
    { href: "/buyers", label: "Data Pembeli", icon: Users, roles: ["OWNER", "STAFF", "DRIVER"] },
    { href: "/transactions", label: "Transaksi", icon: Receipt, roles: ["OWNER", "STAFF", "DRIVER"] },
    { href: "/deliveries", label: "Pengiriman", icon: Truck, roles: ["OWNER", "STAFF", "DRIVER"] },
    { href: "/reports", label: "Laporan", icon: BarChart3, roles: ["OWNER", "STAFF"] },
    { href: "/users", label: "Kelola User", icon: UserCog, roles: ["OWNER"] },
    { href: "/notifications", label: "Notifikasi", icon: Bell, roles: ["OWNER", "STAFF", "DRIVER"] },
    { href: "/settings", label: "Pengaturan", icon: Settings, roles: ["OWNER"] },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(user.role));

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Pemilik (Owner)";
      case "STAFF":
        return "Staf";
      case "DRIVER":
        return "Driver (Pengirim)";
      default:
        return role;
    }
  };

  return (
    <aside
      className={cn(
        "sidebar",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">{user.tenantName ? user.tenantName.substring(0, 1).toUpperCase() : "K"}</div>
        <span className="sidebar-logo-text" title={user.tenantName || "KurbanKu"}>
          {user.tenantName || "KurbanKu"}
        </span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Menu Utama</div>
        <nav className="sidebar-nav">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={cn("sidebar-link", isActive && "active")}
              >
                <Icon />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{getInitials(user.name)}</div>
          <div className="sidebar-user-info" style={{ flex: 1 }}>
            <div className="sidebar-user-name" title={user.name}>
              {user.name}
            </div>
            <div className="sidebar-user-role">{getRoleLabel(user.role)}</div>
          </div>
          <button
            onClick={logout}
            className="btn btn-ghost btn-icon"
            style={{ color: "rgba(255,255,255,0.4)", padding: "4px" }}
            title="Keluar"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
