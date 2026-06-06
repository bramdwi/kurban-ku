"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit2, Trash2, Search, User, Phone, MapPin } from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Buyer } from "@/types";
import toast from "react-hot-toast";

export default function BuyersPage() {
  const { user } = useAuth();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canEdit = user?.role === "OWNER" || user?.role === "STAFF";
  const canDelete = user?.role === "OWNER";

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/buyers?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setBuyers(json.data);
      }
    } catch (err) {
      toast.error("Gagal memuat data pembeli");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBuyers();
  };

  const openAddModal = () => {
    setSelectedBuyer(null);
    setName("");
    setPhone("");
    setAddress("");
    setNotes("");
    setFormOpen(true);
  };

  const openEditModal = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setName(buyer.name);
    setPhone(buyer.phone || "");
    setAddress(buyer.address || "");
    setNotes(buyer.notes || "");
    setFormOpen(true);
  };

  const openDeleteDialog = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Nama wajib diisi");
      return;
    }

    setSubmitting(true);
    const payload = { name, phone, address, notes };

    try {
      const url = selectedBuyer ? `/api/buyers/${selectedBuyer.id}` : "/api/buyers";
      const method = selectedBuyer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(selectedBuyer ? "Data pembeli diperbarui" : "Pembeli baru berhasil ditambahkan");
        setFormOpen(false);
        fetchBuyers();
      } else {
        toast.error(json.error || "Gagal menyimpan data");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBuyer) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/buyers/${selectedBuyer.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Data pembeli berhasil dihapus");
        setDeleteDialogOpen(false);
        fetchBuyers();
      } else {
        toast.error(json.error || "Gagal menghapus data");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
      setSelectedBuyer(null);
    }
  };

  const columns = [
    {
      header: "Nama Pembeli",
      accessor: (row: Buyer) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <User size={16} style={{ color: "var(--color-accent)" }} />
          <span style={{ fontWeight: 600 }}>{row.name}</span>
        </div>
      ),
    },
    {
      header: "Nomor Telepon",
      accessor: (row: Buyer) => (
        row.phone ? (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Phone size={14} style={{ color: "var(--color-text-muted)" }} />
            <span>{row.phone}</span>
          </div>
        ) : "-"
      ),
    },
    {
      header: "Alamat",
      accessor: (row: Buyer) => (
        row.address ? (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <MapPin size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
            <span style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.address}>
              {row.address}
            </span>
          </div>
        ) : "-"
      ),
    },
    {
      header: "Keterangan",
      accessor: (row: Buyer) => row.notes || "-",
    },
    {
      header: "Aksi",
      accessor: (row: Buyer) => (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {canEdit && (
            <button
              onClick={() => openEditModal(row)}
              className="btn btn-secondary btn-icon btn-sm"
              title="Ubah"
              aria-label="Edit buyer"
            >
              <Edit2 size={14} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => openDeleteDialog(row)}
              className="btn btn-danger btn-icon btn-sm"
              title="Hapus"
              aria-label="Delete buyer"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Daftar Pembeli / Pelanggan</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Kelola profil pelanggan yang melakukan pemesanan atau pembelian hewan kurban.
          </p>
        </div>
        {canEdit && (
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} />
            Tambah Pembeli
          </button>
        )}
      </div>

      {/* Filter search */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "var(--space-3)" }}>
          <div style={{ position: "relative", flex: 1 }}>
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
              type="text"
              className="form-input"
              placeholder="Cari berdasarkan nama, telepon, alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Cari
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <DataTable
          columns={columns}
          data={buyers}
          loading={loading}
          emptyTitle="Belum ada pembeli"
          emptyDescription="Silakan tambah pembeli baru atau periksa filter pencarian Anda."
        />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedBuyer ? "Ubah Data Pembeli" : "Tambah Pembeli Baru"}
        footer={
          <>
            <button
              onClick={() => setFormOpen(false)}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Batal
            </button>
            <button onClick={handleSubmit} className="btn btn-primary" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name-input">
              Nama Lengkap <span className="required">*</span>
            </label>
            <input
              id="name-input"
              type="text"
              className="form-input"
              placeholder="Contoh: H. Ahmad Fauzi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone-input">Nomor Telepon / WhatsApp</label>
            <input
              id="phone-input"
              type="tel"
              className="form-input"
              placeholder="Contoh: 081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address-input">Alamat Lengkap</label>
            <textarea
              id="address-input"
              className="form-textarea"
              placeholder="Tulis alamat untuk kebutuhan pengiriman hewan..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="notes-input">Catatan Khusus</label>
            <input
              id="notes-input"
              type="text"
              className="form-input"
              placeholder="Keterangan tambahan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            />
          </div>
        </form>
      </Modal>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Data Pembeli"
        message={`Apakah Anda yakin ingin menghapus pembeli "${selectedBuyer?.name}"?`}
        isLoading={submitting}
      />
    </div>
  );
}
