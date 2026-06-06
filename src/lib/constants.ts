export const APP_NAME = 'KurbanKu';
export const APP_DESCRIPTION = 'Sistem Manajemen Penjualan Hewan Kurban';
export const APP_VERSION = '1.0.0';

export const SPECIES_OPTIONS = [
  { value: 'SAPI', label: 'Sapi' },
  { value: 'KAMBING', label: 'Kambing' },
  { value: 'DOMBA', label: 'Domba' },
] as const;

export const ANIMAL_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Tersedia' },
  { value: 'BOOKED', label: 'Dipesan' },
  { value: 'SOLD', label: 'Terjual' },
  { value: 'DEAD', label: 'Mati' },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'UNPAID', label: 'Belum Bayar' },
  { value: 'DP_PAID', label: 'DP Dibayar' },
  { value: 'FULLY_PAID', label: 'Lunas' },
] as const;

export const TRANSACTION_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'CONFIRMED', label: 'Dikonfirmasi' },
  { value: 'DELIVERED', label: 'Terkirim' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
] as const;

export const DELIVERY_STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Terjadwal' },
  { value: 'IN_TRANSIT', label: 'Dalam Perjalanan' },
  { value: 'DELIVERED', label: 'Terkirim' },
  { value: 'FAILED', label: 'Gagal' },
] as const;

export const ROLE_OPTIONS = [
  { value: 'OWNER', label: 'Pemilik (Owner)' },
  { value: 'STAFF', label: 'Staf' },
  { value: 'DRIVER', label: 'Driver (Pengirim)' },
] as const;

export const PAYMENT_TYPE_OPTIONS = [
  { value: 'DP', label: 'Down Payment (DP)' },
  { value: 'INSTALLMENT', label: 'Cicilan' },
  { value: 'FULL_PAYMENT', label: 'Pembayaran Penuh' },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'CASH', label: 'Tunai' },
  { value: 'TRANSFER', label: 'Transfer Bank' },
  { value: 'QRIS', label: 'QRIS' },
  { value: 'OTHER', label: 'Lainnya' },
] as const;

export const EXPENSE_CATEGORIES = [
  'Pembelian Hewan',
  'Pakan',
  'Transportasi',
  'Operasional',
  'Gaji',
  'Sewa',
  'Perawatan',
  'Lainnya',
] as const;

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;
