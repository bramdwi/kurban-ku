"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { UserPlus, Mail, Lock, Eye, EyeOff, Building, User, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const [tenantName, setTenantName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenantName || !name || !email || !password) {
      toast.error("Kolom bertanda bintang (*) wajib diisi");
      return;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      tenantName,
      name,
      email,
      password,
      phone,
      address,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Registrasi berhasil! Selamat datang.");
    } else {
      toast.error(result.error || "Registrasi gagal");
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: "var(--space-8)",
        backdropFilter: "blur(16px)",
        background: "rgba(var(--color-bg-card), 0.8)",
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
        <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-1)" }}>
          Mulai Usaha Hewan Kurban
        </h2>
        <p className="card-subtitle" style={{ fontSize: "var(--text-sm)" }}>
          Daftarkan usaha Anda dan kelola kurban secara terorganisir
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="tenantName">
            Nama Usaha / Peternakan *
          </label>
          <div style={{ position: "relative" }}>
            <Building
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
              }}
            />
            <input
              id="tenantName"
              type="text"
              className="form-input"
              placeholder="e.g. Peternakan Berkah Jaya"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              style={{ paddingLeft: "42px" }}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Nama Pemilik (Owner) *
          </label>
          <div style={{ position: "relative" }}>
            <User
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
              }}
            />
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Nama Lengkap Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ paddingLeft: "42px" }}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Alamat Email *
          </label>
          <div style={{ position: "relative" }}>
            <Mail
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
              }}
            />
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: "42px" }}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phone">
            Nomor Telepon / WhatsApp
          </label>
          <div style={{ position: "relative" }}>
            <Phone
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
              }}
            />
            <input
              id="phone"
              type="text"
              className="form-input"
              placeholder="e.g. 08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ paddingLeft: "42px" }}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="address">
            Alamat Kandang / Toko
          </label>
          <div style={{ position: "relative" }}>
            <MapPin
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
              }}
            />
            <input
              id="address"
              type="text"
              className="form-input"
              placeholder="Alamat lengkap usaha"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ paddingLeft: "42px" }}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Kata Sandi *
          </label>
          <div style={{ position: "relative" }}>
            <Lock
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
              }}
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: "42px", paddingRight: "42px" }}
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
              tabIndex={-1}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Konfirmasi Kata Sandi *
          </label>
          <div style={{ position: "relative" }}>
            <Lock
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
              }}
            />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="Ulangi kata sandi"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ paddingLeft: "42px" }}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "var(--space-4)", height: "46px" }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Mendaftarkan..."
          ) : (
            <>
              <UserPlus size={18} />
              Daftar Sekarang
            </>
          )}
        </button>
      </form>

      <div
        style={{
          marginTop: "var(--space-6)",
          borderTop: "1px solid var(--color-border)",
          paddingTop: "var(--space-4)",
          textAlign: "center",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
        }}
      >
        Sudah memiliki akun bisnis?{" "}
        <Link href="/login" style={{ color: "var(--color-accent)", fontWeight: 600 }}>
          Masuk
        </Link>
      </div>
    </div>
  );
}
