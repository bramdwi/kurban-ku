import { z } from 'zod';

// ===== AUTH =====
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// ===== ANIMAL =====
export const animalSchema = z.object({
  species: z.enum(['SAPI', 'KAMBING', 'DOMBA'], {
    message: 'Jenis hewan wajib dipilih',
  }),
  weight: z
    .number({ message: 'Berat wajib diisi' })
    .positive('Berat harus positif')
    .max(2000, 'Berat maksimal 2000 kg'),
  purchasePrice: z
    .number({ message: 'Harga modal wajib diisi' })
    .positive('Harga modal harus positif'),
  sellingPrice: z
    .number({ message: 'Harga jual wajib diisi' })
    .positive('Harga jual harus positif'),
  status: z.enum(['AVAILABLE', 'BOOKED', 'SOLD', 'DEAD']).optional().default('AVAILABLE'),
  description: z.string().optional(),
});

// ===== ANIMAL TYPE =====
export const animalTypeSchema = z.object({
  species: z.enum(['SAPI', 'KAMBING', 'DOMBA'], {
    message: 'Jenis hewan wajib dipilih',
  }),
  typeName: z.string().min(1, 'Nama tipe wajib diisi').max(100),
  minWeight: z
    .number({ message: 'Berat minimum wajib diisi' })
    .nonnegative('Berat minimum tidak boleh negatif'),
  maxWeight: z
    .number({ message: 'Berat maksimum wajib diisi' })
    .positive('Berat maksimum harus positif'),
  description: z.string().optional(),
}).refine((data) => data.maxWeight > data.minWeight, {
  message: 'Berat maksimum harus lebih besar dari berat minimum',
  path: ['maxWeight'],
});

// ===== BUYER =====
export const buyerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255),
  phone: z
    .string()
    .regex(/^(\+62|62|0)?[0-9]{9,13}$/, 'Nomor telepon tidak valid')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

// ===== TRANSACTION =====
export const transactionSchema = z.object({
  buyerId: z.string().min(1, 'Pembeli wajib dipilih'),
  animalIds: z.array(z.string()).min(1, 'Minimal pilih 1 hewan'),
  dpAmount: z.number().nonnegative('DP tidak boleh negatif').optional().default(0),
  notes: z.string().optional(),
});

// ===== PAYMENT =====
export const paymentSchema = z.object({
  amount: z
    .number({ message: 'Jumlah pembayaran wajib diisi' })
    .positive('Jumlah pembayaran harus positif'),
  paymentType: z.enum(['DP', 'INSTALLMENT', 'FULL_PAYMENT'], {
    message: 'Tipe pembayaran wajib dipilih',
  }),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

// ===== USER =====
export const userSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role: z.enum(['OWNER', 'STAFF', 'DRIVER'], {
    message: 'Role wajib dipilih',
  }),
});

// ===== REGISTER =====
export const registerSchema = z.object({
  tenantName: z.string().min(2, 'Nama usaha minimal 2 karakter').max(100),
  name: z.string().min(2, 'Nama owner/lengkap minimal 2 karakter').max(255),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  phone: z
    .string()
    .regex(/^(\+62|62|0)?[0-9]{9,13}$/, 'Nomor telepon tidak valid')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
});


// ===== DELIVERY =====
export const deliverySchema = z.object({
  transactionId: z.string().min(1, 'Transaksi wajib dipilih'),
  driverId: z.string().optional(),
  scheduledDate: z.string().optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
});

// ===== EXPENSE =====
export const expenseSchema = z.object({
  category: z.string().min(1, 'Kategori wajib diisi'),
  description: z.string().optional(),
  amount: z
    .number({ message: 'Jumlah wajib diisi' })
    .positive('Jumlah harus positif'),
  expenseDate: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AnimalInput = z.infer<typeof animalSchema>;
export type AnimalTypeInput = z.infer<typeof animalTypeSchema>;
export type BuyerInput = z.infer<typeof buyerSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

