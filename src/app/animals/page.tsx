"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Edit2, Trash2, Search, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/ui/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Animal, AnimalType } from "@/types";
import toast from "react-hot-toast";
import { formatCurrency, getSpeciesLabel, getStatusConfig } from "@/lib/utils";

export default function AnimalsPage() {
  const { user } = useAuth();
  
  // Lists state
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Filter state
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("");
  const [status, setStatus] = useState("");
  const [animalTypeId, setAnimalTypeId] = useState("");

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canEdit = user?.role === "OWNER" || user?.role === "STAFF";
  const canDelete = user?.role === "OWNER";

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        species,
        status,
        animalTypeId,
      });

      const res = await fetch(`/api/animals?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAnimals(json.data);
          setTotal(json.total);
        }
      }
    } catch (err) {
      toast.error("Gagal memuat data hewan kurban");
    } finally {
      setLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/animal-types");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setTypes(json.data);
      }
    } catch (err) {
      console.error("Failed to load types:", err);
    }
  };

  // Trigger load on filter change or page change
  useEffect(() => {
    fetchAnimals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, species, status, animalTypeId]);

  // Load types once
  useEffect(() => {
    fetchTypes();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAnimals();
  };

  const openDeleteDialog = (animal: Animal) => {
    setSelectedAnimal(animal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAnimal) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/animals/${selectedAnimal.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Hewan kurban berhasil dihapus");
        setDeleteDialogOpen(false);
        fetchAnimals();
      } else {
        toast.error(json.error || "Gagal menghapus hewan kurban");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setDeleting(false);
      setSelectedAnimal(null);
    }
  };

  // Table columns
  const columns = [
    {
      header: "Kode Hewan",
      accessor: "code" as const,
      className: "font-heading font-bold",
    },
    {
      header: "Jenis",
      accessor: (row: Animal) => (
        <span className="status-badge neutral">{getSpeciesLabel(row.species)}</span>
      ),
    },
    {
      header: "Tipe & Kelas",
      accessor: (row: Animal) => row.animalType?.typeName || "-",
      className: "font-heading",
    },
    {
      header: "Berat",
      accessor: (row: Animal) => `${row.weight} kg`,
      className: "font-mono",
    },
    {
      header: "Harga Modal",
      accessor: (row: Animal) => formatCurrency(row.purchasePrice),
      className: "font-mono",
    },
    {
      header: "Harga Jual",
      accessor: (row: Animal) => formatCurrency(row.sellingPrice),
      className: "font-mono",
    },
    {
      header: "Status",
      accessor: (row: Animal) => {
        const config = getStatusConfig(row.status);
        return <span className={`status-badge ${config.variant}`}>{config.label}</span>;
      },
    },
    {
      header: "Foto",
      accessor: (row: Animal) => `${row.photos?.length || 0} Foto`,
    },
    {
      header: "Aksi",
      accessor: (row: Animal) => (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Link
            href={`/animals/${row.id}`}
            className="btn btn-secondary btn-icon btn-sm"
            title="Lihat Detail"
          >
            <Eye size={14} />
          </Link>
          {canEdit && (
            <Link
              href={`/animals/${row.id}/edit`}
              className="btn btn-secondary btn-icon btn-sm"
              title="Ubah"
            >
              <Edit2 size={14} />
            </Link>
          )}
          {canDelete && (
            <button
              onClick={() => openDeleteDialog(row)}
              className="btn btn-danger btn-icon btn-sm"
              title="Hapus"
              disabled={row.status === "SOLD" || row.status === "BOOKED"}
              aria-label="Delete animal"
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
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Manajemen Hewan Kurban</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Kelola data persediaan hewan kurban (Sapi, Kambing, Domba) beserta foto, berat, dan harga.
          </p>
        </div>
        {canEdit && (
          <Link href="/animals/new" className="btn btn-primary">
            <Plus size={18} />
            Tambah Hewan
          </Link>
        )}
      </div>

      {/* Filters Card */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "var(--space-3)",
            alignItems: "end",
          }}
        >
          {/* Search */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="search-input">Cari Hewan</label>
            <div style={{ position: "relative" }}>
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
                id="search-input"
                type="text"
                className="form-input"
                placeholder="Kode atau deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </div>
          </div>

          {/* Species Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="species-filter">Jenis Hewan</label>
            <select
              id="species-filter"
              className="form-select"
              value={species}
              onChange={(e) => {
                setSpecies(e.target.value);
                setAnimalTypeId(""); // reset class type filter when species changes
                setPage(1);
              }}
            >
              <option value="">Semua Jenis</option>
              <option value="SAPI">Sapi</option>
              <option value="KAMBING">Kambing</option>
              <option value="DOMBA">Domba</option>
            </select>
          </div>

          {/* Class / Type Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="type-filter">Kelas Tipe</label>
            <select
              id="type-filter"
              className="form-select"
              value={animalTypeId}
              onChange={(e) => {
                setAnimalTypeId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Kelas</option>
              {types
                .filter((t) => !species || t.species === species)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {getSpeciesLabel(t.species)} - {t.typeName} ({t.minWeight}-{t.maxWeight} kg)
                  </option>
                ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="status-filter">Status Hewan</label>
            <select
              id="status-filter"
              className="form-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Status</option>
              <option value="AVAILABLE">Tersedia</option>
              <option value="BOOKED">Dipesan</option>
              <option value="SOLD">Terjual</option>
              <option value="DEAD">Mati</option>
            </select>
          </div>

          {/* Filter button */}
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button type="submit" className="btn btn-secondary" style={{ width: "100%" }}>
              <Filter size={16} />
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Data Table */}
      <div className="card" style={{ padding: 0 }}>
        <DataTable
          columns={columns}
          data={animals}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          emptyTitle="Tidak ada hewan kurban"
          emptyDescription="Silakan tambah data hewan baru atau ubah filter pencarian Anda."
        />
      </div>

      {/* Delete dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Hewan Kurban"
        message={`Apakah Anda yakin ingin menghapus data hewan kurban dengan kode "${selectedAnimal?.code}"?`}
        isLoading={deleting}
      />
    </div>
  );
}
