"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password wajib diisi");
      return;
    }

    setIsSubmitting(true);
    const result = await login({ email, password });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Berhasil masuk!");
    } else {
      toast.error(result.error || "Gagal masuk");
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: "var(--space-8)",
        backdropFilter: "blur(16px)",
        background: "rgba(var(--color-bg-card), 0.8)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 800,
            fontSize: "1.75rem",
            margin: "0 auto var(--space-4) auto",
            boxShadow: "0 8px 16px rgba(212, 160, 83, 0.2)",
          }}
        >
          K
        </div>
        <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-1)" }}>
          Selamat Datang di KurbanKu
        </h2>
        <p className="card-subtitle" style={{ fontSize: "var(--text-sm)" }}>
          Masuk untuk mengelola penjualan hewan kurban Anda
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Alamat Email
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
          <label className="form-label" htmlFor="password">
            Kata Sandi
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
              placeholder="••••••••"
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

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "var(--space-4)", height: "46px" }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Memproses..."
          ) : (
            <>
              <LogIn size={18} />
              Masuk ke Sistem
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
        Belum memiliki akun bisnis?{" "}
        <Link href="/register" style={{ color: "var(--color-accent)", fontWeight: 600 }}>
          Daftar Gratis
        </Link>
      </div>
    </div>
  );
}
