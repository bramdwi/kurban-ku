"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Beef, Receipt, Truck, BarChart3, Users, Smartphone } from "lucide-react";

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-body)",
        overflowX: "hidden",
      }}
    >
      {/* Navigation Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "var(--space-6) var(--space-8)",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: "1.25rem",
              boxShadow: "0 4px 12px rgba(212, 160, 83, 0.2)",
            }}
          >
            K
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>KurbanKu</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <Link href="/login" className="btn btn-ghost" style={{ fontWeight: 600 }}>
            Masuk
          </Link>
          <Link href="/register" className="btn btn-primary" style={{ fontWeight: 600 }}>
            Daftar Gratis
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "var(--space-12) var(--space-8) var(--space-20) var(--space-8)",
          textAlign: "center",
        }}
      >
        {/* Glow Effects */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "300px",
            background: "radial-gradient(circle, var(--color-accent-bg) 0%, transparent 70%)",
            filter: "blur(80px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <span
            style={{
              display: "inline-block",
              background: "var(--color-accent-bg)",
              color: "var(--color-accent)",
              padding: "var(--space-2) var(--space-4)",
              borderRadius: "50px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              marginBottom: "var(--space-6)",
              border: "1px solid rgba(212, 160, 83, 0.2)",
            }}
          >
            SaaS Manajemen Penjualan Hewan Kurban #1 di Indonesia
          </span>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: "900px",
              margin: "0 auto var(--space-6) auto",
              background: "linear-gradient(to right, var(--color-text-primary) 30%, var(--color-accent) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Kelola Bisnis Kurban Lebih Mudah, Profesional & Terintegrasi
          </h1>

          <p
            style={{
              fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
              color: "var(--color-text-muted)",
              maxWidth: "650px",
              margin: "0 auto var(--space-10) auto",
              lineHeight: 1.6,
            }}
          >
            Sistem SaaS multi-tenant khusus untuk pedagang hewan kurban. Kelola stok, transaksi penjualan, pembayaran uang muka (DP), penugasan driver, laporan keuangan, hingga notifikasi otomatis.
          </p>

          <div style={{ display: "flex", gap: "var(--space-4)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/register"
              className="btn btn-primary"
              style={{
                padding: "var(--space-4) var(--space-8)",
                fontSize: "1.1rem",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 10px 20px rgba(212, 160, 83, 0.25)",
              }}
            >
              Mulai Sekarang Gratis
              <ArrowRight size={20} style={{ marginLeft: "var(--space-2)" }} />
            </Link>
            <Link
              href="/login"
              className="btn btn-secondary"
              style={{
                padding: "var(--space-4) var(--space-8)",
                fontSize: "1.1rem",
                borderRadius: "var(--radius-lg)",
              }}
            >
              Demo Sistem
            </Link>
          </div>

          {/* Quick Stats / Trust Points */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "var(--space-8)",
              marginTop: "var(--space-16)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <CheckCircle2 style={{ color: "var(--color-accent)" }} size={20} />
              <span style={{ fontWeight: 600 }}>Mudah Digunakan</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <CheckCircle2 style={{ color: "var(--color-accent)" }} size={20} />
              <span style={{ fontWeight: 600 }}>Tanpa Instalasi</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <CheckCircle2 style={{ color: "var(--color-accent)" }} size={20} />
              <span style={{ fontWeight: 600 }}>Isolasi Data 100% Aman</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        style={{
          background: "var(--color-bg-secondary)",
          padding: "var(--space-20) var(--space-8)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "var(--space-3)" }}>
              Fitur Lengkap untuk Manajemen Kurban
            </h2>
            <p style={{ color: "var(--color-text-muted)", maxWidth: "600px", margin: "0 auto" }}>
              Dirancang khusus untuk memenuhi alur kerja penjualan hewan kurban dari stok masuk hingga hewan tiba di lokasi pembeli.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "var(--space-8)",
            }}
          >
            {/* Feature 1 */}
            <div className="card" style={{ padding: "var(--space-6)" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--color-accent-bg)",
                  color: "var(--color-accent)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-4)",
                }}
              >
                <Beef size={24} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                Inventaris & Tipe Hewan
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                Kelola data Sapi, Kambing, dan Domba dengan detail kode unik, jenis/spesies, berat badan, harga modal, harga jual, foto, dan status ketersediaan hewan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{ padding: "var(--space-6)" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--color-accent-bg)",
                  color: "var(--color-accent)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-4)",
                }}
              >
                <Receipt size={24} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                Kasir & Pembayaran DP
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                Catat penjualan dengan fleksibilitas cicilan. Pantau pembayaran DP, sisa tagihan, dan kelola invoice penjualan resmi secara real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{ padding: "var(--space-6)" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--color-accent-bg)",
                  color: "var(--color-accent)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-4)",
                }}
              >
                <Truck size={24} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                Logistik & Driver App
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                Atur jadwal pengiriman, tugaskan driver, dan izinkan driver mengunggah foto bukti penerimaan hewan kurban di lokasi pembeli.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card" style={{ padding: "var(--space-6)" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--color-accent-bg)",
                  color: "var(--color-accent)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-4)",
                }}
              >
                <BarChart3 size={24} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                Laporan & Statistik
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                Dapatkan visualisasi keuntungan bersih, total penjualan, grafik pengeluaran pakan/operasional, serta ringkasan penjualan tipe hewan paling diminati.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card" style={{ padding: "var(--space-6)" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--color-accent-bg)",
                  color: "var(--color-accent)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-4)",
                }}
              >
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                Multi-User & Hak Akses
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                Tambahkan staf penjualan (Staff) dan pengirim (Driver). Batasi akses modul sesuai perannya masing-masing dengan sistem keamanan terisolasi.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card" style={{ padding: "var(--space-6)" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--color-accent-bg)",
                  color: "var(--color-accent)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-4)",
                }}
              >
                <Smartphone size={24} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                Notifikasi WhatsApp
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                Kirim pengingat tagihan pembayaran, konfirmasi pembelian, dan update status pengiriman kepada pembeli secara instan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "var(--space-20) var(--space-8)",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "var(--space-4)" }}>
            Siap untuk Go-Digital?
          </h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              marginBottom: "var(--space-8)",
              fontSize: "1.1rem",
              lineHeight: 1.6,
            }}
          >
            Hanya butuh 1 menit untuk mendaftarkan usaha Anda. Dapatkan kendali penuh atas bisnis penjualan hewan kurban Anda sekarang juga.
          </p>
          <Link
            href="/register"
            className="btn btn-primary"
            style={{
              padding: "var(--space-4) var(--space-8)",
              fontSize: "1.1rem",
              borderRadius: "var(--radius-lg)",
            }}
          >
            Daftarkan Usaha Saya Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "var(--space-8) var(--space-4)",
          textAlign: "center",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
        }}
      >
        <p>&copy; {new Date().getFullYear()} KurbanKu. All rights reserved.</p>
      </footer>
    </div>
  );
}
