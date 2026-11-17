/** Shapes returned by MainApi (kept in step with the web panel's hair.models.ts). */

export type AppointmentStatus = 'pending' | 'confirmed' | 'checkedIn' | 'inProgress' | 'completed' | 'cancelled' | 'noShow';

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Onay bekliyor',
  confirmed: 'Onaylandı',
  checkedIn: 'Geldi',
  inProgress: 'İşlemde',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
  noShow: 'Gelmedi',
};

/** GET /hair/me — present only for salon staff / owners. */
export interface HairMe {
  uid: string;
  email: string | null;
  tenantId: string;
  tenantName: string;
  role: 'admin' | 'manager' | 'receptionist' | 'stylist' | 'cashier' | null;
  isOwner: boolean;
  branchIds: string[] | null;
}

export interface PublicSalonInfo {
  tenantName: string;
  branchName: string;
  address: string;
  phone: string;
  workDayStart: string;
  workDayEnd: string;
  workDays: number[];
  logoUrl?: string;
  onlineBookingEnabled?: boolean;
  showPrices?: boolean;
  onlineBookingShowPrices?: boolean;
  requireBookingOtp?: boolean;
}

export interface PublicService {
  id: string;
  categoryName?: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
}

export interface PublicStaff {
  id: string;
  name: string;
  photoUrl?: string;
  specialties?: string[];
}

export interface PublicBookingDto {
  serviceIds: string[];
  staffId?: string;
  date: string;
  startTime: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  notes?: string;
  otpCode?: string;
}

export interface PublicAppointment {
  id: string;
  token: string;
  status: AppointmentStatus;
  date: string;
  startTime: string;
  endTime: string;
  staffName?: string;
  services: { serviceName: string; price: number; durationMinutes: number }[];
  totalPrice: number;
  showPrices?: boolean;
  customerName: string;
  customerPhoneMasked: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  staffId: string;
  staffName: string;
  staffColor?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  source: string;
  services: { serviceId: string; serviceName: string; price: number; durationMinutes: number }[];
  totalPrice: number;
  notes?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  totalVisits: number;
  totalSpent: number;
  lastVisitDate?: string;
  tags?: string[];
}

export interface DashboardData {
  todayRevenue: number;
  todayAppointments: number;
  totalCustomers: number;
  pendingAppointments: number;
}
