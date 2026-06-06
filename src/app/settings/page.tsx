"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Settings,
  User,
  Building,
  Save,
  Lock,
  Eye,
  EyeOff,
  Globe,
  BellRing,
} from "lucide-react";
import toast from "react-hot-toast";

type SettingTab = "profile" | "business";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingTab>("profile");
  const [loading, setLoading] = useState(false);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Business fields
  const [businessName, setBusinessName] = useState("KurbanKu Farm");
  const [businessPhone, setBusinessPhone] = useState("081234567890");
  const [businessAddress, setBusinessAddress] = useState(
    "Jl. Raya Peternakan No. 45, Bogor, Jawa Barat"
  );
  const [businessEmail, setBusinessEmail] = useState("info@kurbanku-farm.com");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    // Load business settings from localstorage
    const storedName = localStorage.getItem("kurbanku_biz_name");
    const storedPhone = localStorage.getItem("kurbanku_biz_phone");
    const storedAddress = localStorage.getItem("kurbanku_biz_address");
    const storedEmail = localStorage.getItem("kurbanku_biz_email");

    if (storedName) setBusinessName(storedName);
    if (storedPhone) setBusinessPhone(storedPhone);
    if (storedAddress) setBusinessAddress(storedAddress);
    if (storedEmail) setBusinessEmail(storedEmail);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Nama dan Email wajib diisi");
      return;
    }
    if (!user?.userId) return;

    setLoading(true);
    try {
      const payload: any = { name, email };
      if (password) payload.password = password;

      const res = await fetch(`/api/users/${user.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Profil Anda berhasil diperbarui!");
        setPassword("");
        // Reload page to refresh auth context or prompt re-login
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(json.error || "Gagal memperbarui profil");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("kurbanku_biz_name", businessName);
    localStorage.setItem("kurbanku_biz_phone", businessPhone);
    localStorage.setItem("kurbanku_biz_address", businessAddress);
    localStorage.setItem("kurbanku_biz_email", businessEmail);
    toast.success("Pengaturan bisnis berhasil disimpan!");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Pengaturan Aplikasi</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
          Kelola informasi profil pribadi Anda dan pengaturan bisnis peternakan.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-1)",
          background: "var(--color-bg-secondary)",
          padding: "4px",
          borderRadius: "var(--radius-xl)",
          width: "fit-content",
        }}
      >
        <button
          onClick={() => setActiveTab("profile")}
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
            background: activeTab === "profile" ? "var(--color-bg)" : "transparent",
            color: activeTab === "profile" ? "var(--color-primary)" : "var(--color-text-muted)",
            boxShadow: activeTab === "profile" ? "var(--shadow-sm)" : "none",
          }}
        >
          <User size={16} />
          Profil Saya
        </button>
        <button
          onClick={() => setActiveTab("business")}
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
            background: activeTab === "business" ? "var(--color-bg)" : "transparent",
            color: activeTab === "business" ? "var(--color-primary)" : "var(--color-text-muted)",
            boxShadow: activeTab === "business" ? "var(--shadow-sm)" : "none",
          }}
        >
          <Building size={16} />
          Informasi Bisnis
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", maxWidth: "650px" }}>
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="card" style={{ padding: "var(--space-6)" }}>
            <h3
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 700,
                marginBottom: "var(--space-4)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <User size={18} style={{ color: "var(--color-accent)" }} />
              Kelola Profil Akun
            </h3>
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">
                  Nama Lengkap
                </label>
                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-role">
                  Role Akses
                </label>
                <input
                  id="profile-role"
                  type="text"
                  className="form-input"
                  value={
                    user?.role === "OWNER"
                      ? "Pemilik (Owner)"
                      : user?.role === "STAFF"
                      ? "Staf"
                      : "Driver (Pengirim)"
                  }
                  disabled
                  style={{ background: "var(--color-bg-secondary)", cursor: "not-allowed" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-password">
                  Password Baru (Kosongkan jika tidak diubah)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="profile-password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    disabled={loading}
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                      padding: "4px",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "fit-content", marginTop: "var(--space-2)" }}
                disabled={loading}
              >
                <Save size={16} />
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        )}

        {/* Business Settings Tab */}
        {activeTab === "business" && (
          <div className="card" style={{ padding: "var(--space-6)" }}>
            <h3
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 700,
                marginBottom: "var(--space-4)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Building size={18} style={{ color: "var(--color-accent)" }} />
              Identitas Bisnis & Notifikasi
            </h3>
            <form onSubmit={handleSaveBusiness} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="biz-name">
                  Nama Bisnis / Peternakan
                </label>
                <input
                  id="biz-name"
                  type="text"
                  className="form-input"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="biz-phone">
                  Nomor Kontak / WhatsApp Bisnis
                </label>
                <input
                  id="biz-phone"
                  type="text"
                  className="form-input"
                  placeholder="Format: 08..."
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  required
                />
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  Digunakan sebagai pengirim notifikasi WhatsApp dan detail kontak pada Invoice.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="biz-email">
                  Email Bisnis
                </label>
                <input
                  id="biz-email"
                  type="email"
                  className="form-input"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="biz-address">
                  Alamat Lengkap Peternakan
                </label>
                <textarea
                  id="biz-address"
                  className="form-textarea"
                  rows={3}
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "fit-content", marginTop: "var(--space-2)" }}
              >
                <Save size={16} />
                Simpan Identitas
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
