import type { Species } from '@/types';

// Format currency to Indonesian Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number with thousands separator
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

// Format date to Indonesian locale
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

// Format datetime
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(date);
  if (days > 0) return `${days} hari lalu`;
  if (hours > 0) return `${hours} jam lalu`;
  if (minutes > 0) return `${minutes} menit lalu`;
  return 'Baru saja';
}

// Generate animal code: KRB-SP-001, KRB-KM-001, KRB-DM-001
export function generateAnimalCode(species: Species, sequence: number): string {
  const prefix: Record<Species, string> = {
    SAPI: 'SP',
    KAMBING: 'KM',
    DOMBA: 'DM',
  };
  return `KRB-${prefix[species]}-${String(sequence).padStart(3, '0')}`;
}

// Generate invoice number: INV-20260601-001
export function generateInvoiceNumber(sequence: number): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `INV-${dateStr}-${String(sequence).padStart(3, '0')}`;
}

// Get species display name
export function getSpeciesLabel(species: Species): string {
  const labels: Record<Species, string> = {
    SAPI: 'Sapi',
    KAMBING: 'Kambing',
    DOMBA: 'Domba',
  };
  return labels[species] || species;
}

// Get status display config
export function getStatusConfig(status: string): { label: string; variant: string } {
  const configs: Record<string, { label: string; variant: string }> = {
    // Animal status
    AVAILABLE: { label: 'Tersedia', variant: 'success' },
    BOOKED: { label: 'Dipesan', variant: 'warning' },
    SOLD: { label: 'Terjual', variant: 'info' },
    DEAD: { label: 'Mati', variant: 'danger' },
    // Payment status
    UNPAID: { label: 'Belum Bayar', variant: 'danger' },
    DP_PAID: { label: 'DP Dibayar', variant: 'warning' },
    FULLY_PAID: { label: 'Lunas', variant: 'success' },
    // Transaction status
    PENDING: { label: 'Menunggu', variant: 'warning' },
    CONFIRMED: { label: 'Dikonfirmasi', variant: 'success' },
    DELIVERED: { label: 'Terkirim', variant: 'info' },
    CANCELLED: { label: 'Dibatalkan', variant: 'danger' },
    // Delivery status
    SCHEDULED: { label: 'Terjadwal', variant: 'info' },
    IN_TRANSIT: { label: 'Dalam Perjalanan', variant: 'warning' },
    FAILED: { label: 'Gagal', variant: 'danger' },
  };
  return configs[status] || { label: status, variant: 'neutral' };
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Clamp number
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Calculate profit
export function calculateProfit(sellingPrice: number, purchasePrice: number): number {
  return sellingPrice - purchasePrice;
}

// Calculate profit margin
export function calculateMargin(sellingPrice: number, purchasePrice: number): number {
  if (purchasePrice === 0) return 0;
  return ((sellingPrice - purchasePrice) / purchasePrice) * 100;
}

// cn utility for conditional classNames
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
