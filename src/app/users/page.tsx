"use client";

import React, { useEffect, useState } from "react";
import {
  UserCog,
  Plus,
  Search,
  Edit3,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Truck as TruckIcon,
  Eye,
  EyeOff,
  X,
  Save,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { User, UserRole } from "@/types";
import toast from "react-hot-toast";
import { formatDateTime, getInitials } from "@/lib/utils";

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  OWNER: { label: "Pemilik", color: "var(--color-primary)", icon: ShieldCheck },
  STAFF: { label: "Staf", color: "var(--color-success)", icon: Shield },
  DRIVER: { label: "Driver", color: "var(--color-warning)", icon: TruckIcon },
};

export default function UsersPage() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as UserRole,
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, role: roleFilter });
      const res = await fetch(`/api/users?${params.toString()}`);
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch {
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "STAFF" });
    setShowPassword(false);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: "", role: user.role });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PATCH" : "POST";
      const body: any = { name: formData.name, email: formData.email, role: formData.role };
      if (formData.password) body.password = formData.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(editingUser ? "User berhasil diperbarui" : "User berhasil ditambahkan");
        setShowModal(false);
        fetchUsers();
      } else {
        toast.error(json.error || "Gagal menyimpan user");
      }
    } catch {
      toast.error("Gagal menyimpan user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      const res = await fetch(`/api/users/${deleteUser.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("User berhasil dihapus");
        setDeleteUser(null);
        fetchUsers();
      } else {
        toast.error(json.error || "Gagal menghapus user");
      }
    } catch {
      toast.error("Gagal menghapus user");
    }
  };

  const handleToggleActive = async (targetUser: User) => {
    try {
      const res = await fetch(`/api/users/${targetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !targetUser.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`User ${!targetUser.isActive ? "diaktifkan" : "dinonaktifkan"}`);
        fetchUsers();
      }
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  const columns = [
    {
      header: "User",
      accessor: (row: User) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: `${ROLE_CONFIG[row.role]?.color || "var(--color-primary)"}20`,
              color: ROLE_CONFIG[row.role]?.color || "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "var(--text-sm)",
              flexShrink: 0,
            }}
          >
            {getInitials(row.name)}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{row.name}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (row: User) => {
        const config = ROLE_CONFIG[row.role];
        const Icon = config?.icon || Shield;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Icon size={14} style={{ color: config?.color || "var(--color-text-muted)" }} />
            <span style={{ fontWeight: 600, color: config?.color || "var(--color-text)", fontSize: "var(--text-sm)" }}>
              {config?.label || row.role}
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: (row: User) => (
        <button
          onClick={() => handleToggleActive(row)}
          className={`status-badge ${row.isActive ? "success" : "danger"}`}
          style={{ cursor: "pointer", border: "none" }}
          title={row.isActive ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
        >
          {row.isActive ? "Aktif" : "Nonaktif"}
        </button>
      ),
    },
    {
      header: "Terdaftar",
      accessor: (row: User) => (
        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Aksi",
      accessor: (row: User) => (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button onClick={() => openEditModal(row)} className="btn btn-secondary btn-icon btn-sm" title="Edit">
            <Edit3 size={14} />
          </button>
          {row.id !== authUser?.userId && (
            <button onClick={() => setDeleteUser(row)} className="btn btn-danger btn-icon btn-sm" title="Hapus">
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
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Manajemen User</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Kelola akun pengguna, role, dan hak akses sistem.
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <UserPlus size={18} /> Tambah User
        </button>
      </div>

      {/* Role summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--space-3)" }}>
        {Object.entries(ROLE_CONFIG).map(([role, config]) => {
          const count = users.filter((u) => u.role === role).length;
          const Icon = config.icon;
          return (
            <div
              key={role}
              className="card"
              style={{
                padding: "var(--space-3) var(--space-4)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                cursor: "pointer",
                border: roleFilter === role ? `2px solid ${config.color}` : undefined,
                transition: "border-color 0.2s",
              }}
              onClick={() => setRoleFilter(roleFilter === role ? "" : role)}
            >
              <Icon size={20} style={{ color: config.color }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>{count}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{config.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "var(--space-3)", alignItems: "end" }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label" htmlFor="user-search">Cari User</label>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                id="user-search"
                type="text"
                className="form-input"
                placeholder="Nama atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-secondary">Cari</button>
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyTitle="Tidak ada user"
          emptyDescription="Tambahkan user baru untuk memberikan akses ke sistem."
        />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal isOpen={showModal} title={editingUser ? "Edit User" : "Tambah User Baru"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="user-name">Nama Lengkap</label>
              <input
                id="user-name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="user-email">Email</label>
              <input
                id="user-email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="user-password">
                {editingUser ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  minLength={6}
                  placeholder={editingUser ? "Biarkan kosong untuk tidak diubah" : "Minimal 6 karakter"}
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
            <div className="form-group">
              <label className="form-label" htmlFor="user-role">Role</label>
              <select
                id="user-role"
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              >
                {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} />
                {saving ? "Menyimpan..." : editingUser ? "Perbarui" : "Tambahkan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteUser}
        title="Hapus User"
        message={`Apakah Anda yakin ingin menghapus user "${deleteUser?.name || ""}"? User yang dihapus tidak akan bisa login lagi.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteUser(null)}
        confirmLabel="Hapus"
        isDanger={true}
      />
    </div>
  );
}
