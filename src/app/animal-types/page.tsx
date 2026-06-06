"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit2, Trash2, Tag, ArrowRight } from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { AnimalType, Species } from "@/types";
import toast from "react-hot-toast";
import { getSpeciesLabel } from "@/lib/utils";

export default function AnimalTypesPage() {
  const { user } = useAuth();
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<AnimalType | null>(null);

  // Form states
  const [species, setSpecies] = useState<Species>("SAPI");
  const [typeName, setTypeName] = useState("");
  const [minWeight, setMinWeight] = useState<number>(0);
  const [maxWeight, setMaxWeight] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditable = user?.role === "OWNER" || user?.role === "STAFF";

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/animal-types");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setTypes(json.data);
        }
      }
    } catch (err) {
      toast.error("Gagal memuat tipe hewan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const openAddModal = () => {
    setSelectedType(null);
    setSpecies("SAPI");
    setTypeName("");
    setMinWeight(0);
    setMaxWeight(0);
    setDescription("");
    setFormOpen(true);
  };

  const openEditModal = (type: AnimalType) => {
    setSelectedType(type);
    setSpecies(type.species);
    setTypeName(type.typeName);
    setMinWeight(type.minWeight);
    setMaxWeight(type.maxWeight);
    setDescription(type.description || "");
    setFormOpen(true);
  };

  const openDeleteDialog = (type: AnimalType) => {
    setSelectedType(type);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minWeight >= maxWeight) {
      toast.error("Berat maksimum harus lebih besar dari berat minimum");
      return;
    }

    setSubmitting(true);
    const payload = { species, typeName, minWeight, maxWeight, description };

    try {
      const url = selectedType ? `/api/animal-types/${selectedType.id}` : "/api/animal-types";
      const method = selectedType ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(selectedType ? "Tipe hewan berhasil diperbarui" : "Tipe hewan berhasil ditambahkan");
        setFormOpen(false);
        fetchTypes();
      } else {
        toast.error(json.error || "Gagal menyimpan tipe hewan");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedType) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/animal-types/${selectedType.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Tipe hewan berhasil dihapus");
        setDeleteDialogOpen(false);
        fetchTypes();
      } else {
        toast.error(json.error || "Gagal menghapus tipe hewan");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
      setSelectedType(null);
    }
  };

  const columns = [
    {
      header: "Jenis Hewan",
      accessor: (row: AnimalType) => (
        <span className="status-badge info" style={{ fontWeight: 600 }}>
          {getSpeciesLabel(row.species)}
        </span>
      ),
    },
    {
      header: "Nama Tipe",
      accessor: "typeName" as const,
      className: "font-heading",
    },
    {
      header: "Rentang Berat",
      accessor: (row: AnimalType) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
          <span>{row.minWeight} kg</span>
          <ArrowRight size={14} style={{ color: "var(--color-text-muted)" }} />
          <span>{row.maxWeight} kg</span>
        </div>
      ),
    },
    {
      header: "Keterangan",
      accessor: (row: AnimalType) => row.description || "-",
    },
    ...(isEditable
      ? [
          {
            header: "Aksi",
            accessor: (row: AnimalType) => (
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  onClick={() => openEditModal(row)}
                  className="btn btn-secondary btn-icon btn-sm"
                  title="Ubah"
                  aria-label="Edit type"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => openDeleteDialog(row)}
                  className="btn btn-danger btn-icon btn-sm"
                  title="Hapus"
                  aria-label="Delete type"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Kategori & Tipe Hewan</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Kelola pembagian klasifikasi tipe hewan kurban berdasarkan bobot/berat badan.
          </p>
        </div>
        {isEditable && (
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} />
            Tambah Tipe
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DataTable
          columns={columns}
          data={types}
          loading={loading}
          emptyTitle="Belum ada tipe hewan"
          emptyDescription="Klasifikasi tipe hewan berdasarkan berat kurban belum dibuat."
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedType ? "Ubah Tipe Hewan" : "Tambah Tipe Hewan Baru"}
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
            <label className="form-label" htmlFor="species-select">Jenis Hewan</label>
            <select
              id="species-select"
              className="form-select"
              value={species}
              onChange={(e) => setSpecies(e.target.value as Species)}
              disabled={submitting || !!selectedType}
            >
              <option value="SAPI">Sapi</option>
              <option value="KAMBING">Kambing</option>
              <option value="DOMBA">Domba</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="type-name-input">Nama Tipe / Kelas</label>
            <input
              id="type-name-input"
              type="text"
              className="form-input"
              placeholder="Contoh: Premium, Super, Standard, Ekonomis"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="min-weight-input">Berat Minimum (kg)</label>
              <input
                id="min-weight-input"
                type="number"
                step="0.1"
                className="form-input"
                placeholder="0"
                value={minWeight || ""}
                onChange={(e) => setMinWeight(parseFloat(e.target.value))}
                required
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="max-weight-input">Berat Maksimum (kg)</label>
              <input
                id="max-weight-input"
                type="number"
                step="0.1"
                className="form-input"
                placeholder="0"
                value={maxWeight || ""}
                onChange={(e) => setMaxWeight(parseFloat(e.target.value))}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description-input">Keterangan Tambahan</label>
            <textarea
              id="description-input"
              className="form-textarea"
              placeholder="Tulis spesifikasi tambahan atau detail mengenai tipe ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Tipe Hewan"
        message={`Apakah Anda yakin ingin menghapus tipe "${selectedType?.typeName}" untuk ${selectedType && getSpeciesLabel(selectedType.species)}?`}
        isLoading={submitting}
      />
    </div>
  );
}
