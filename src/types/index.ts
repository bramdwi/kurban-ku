// ===== ENUMS =====
export type Species = 'SAPI' | 'KAMBING' | 'DOMBA';
export type AnimalStatus = 'AVAILABLE' | 'BOOKED' | 'SOLD' | 'DEAD';
export type PaymentStatus = 'UNPAID' | 'DP_PAID' | 'FULLY_PAID';
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
export type PaymentType = 'DP' | 'INSTALLMENT' | 'FULL_PAYMENT';
export type DeliveryStatus = 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
export type UserRole = 'OWNER' | 'STAFF' | 'DRIVER';
export type NotificationType = 'PAYMENT_REMINDER' | 'PURCHASE_CONFIRMATION' | 'DELIVERY_UPDATE';
export type WAStatus = 'PENDING' | 'SENT' | 'FAILED';

// ===== MODELS =====
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  tenant?: Tenant;
}

export interface AnimalType {
  id: string;
  tenantId: string;
  species: Species;
  typeName: string;
  minWeight: number;
  maxWeight: number;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Animal {
  id: string;
  tenantId: string;
  code: string;
  animalTypeId?: string | null;
  species: Species;
  weight: number;
  purchasePrice: number;
  sellingPrice: number;
  status: AnimalStatus;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  animalType?: AnimalType | null;
  photos?: AnimalPhoto[];
}

export interface AnimalPhoto {
  id: string;
  animalId: string;
  photoUrl: string;
  sortOrder: number;
  createdAt: string;
}

export interface Buyer {
  id: string;
  tenantId: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  buyerId: string;
  createdBy: string;
  totalAmount: number;
  dpAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  status: TransactionStatus;
  notes?: string | null;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  buyer?: Buyer;
  creator?: User;
  items?: TransactionItem[];
  payments?: Payment[];
  deliveries?: Delivery[];
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  animalId: string;
  price: number;
  createdAt: string;
  animal?: Animal;
}

export interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod?: string | null;
  notes?: string | null;
  paymentDate: string;
  createdAt: string;
}

export interface Delivery {
  id: string;
  tenantId: string;
  transactionId: string;
  driverId?: string | null;
  scheduledDate?: string | null;
  deliveryAddress?: string | null;
  status: DeliveryStatus;
  notes?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  transaction?: Transaction;
  driver?: User;
  photos?: DeliveryPhoto[];
}

export interface DeliveryPhoto {
  id: string;
  deliveryId: string;
  photoUrl: string;
  caption?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  tenantId: string;
  userId?: string | null;
  transactionId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  waStatus?: WAStatus | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  tenantId: string;
  category: string;
  description?: string | null;
  amount: number;
  expenseDate: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ===== API TYPES =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalAnimals: number;
  availableAnimals: number;
  soldAnimals: number;
  bookedAnimals: number;
  totalRevenue: number;
  totalProfit: number;
  totalDebt: number;
  totalTransactions: number;
  monthlyRevenue: { month: string; revenue: number; profit: number }[];
  speciesDistribution: { species: string; count: number }[];
  recentTransactions: Transaction[];
}

export interface FinancialReport {
  totalPurchaseCost: number;
  totalRevenue: number;
  totalIncome: number;
  totalExpenses: number;
  supplierDebt: number;
  customerDebt: number;
  grossProfit: number;
  netProfit: number;
}

// ===== FORM TYPES =====
export interface RegisterFormData {
  businessName: string;
  ownerName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface AnimalFormData {
  species: Species;
  weight: number;
  purchasePrice: number;
  sellingPrice: number;
  status?: AnimalStatus;
  description?: string;
}

export interface BuyerFormData {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface TransactionFormData {
  buyerId: string;
  animalIds: string[];
  dpAmount?: number;
  notes?: string;
}

export interface PaymentFormData {
  amount: number;
  paymentType: PaymentType;
  paymentMethod?: string;
  notes?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface AnimalTypeFormData {
  species: Species;
  typeName: string;
  minWeight: number;
  maxWeight: number;
  description?: string;
}

export interface DeliveryFormData {
  transactionId: string;
  driverId?: string;
  scheduledDate?: string;
  deliveryAddress?: string;
  notes?: string;
}
