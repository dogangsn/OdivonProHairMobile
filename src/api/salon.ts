import { api, listItems } from '../lib/api';
import type { Appointment, AppointmentStatus, Customer, DashboardData, HairMe } from './types';

/** Salon (staff) endpoints; the signed-in user's tenant and role are resolved by MainApi. */
export const salonApi = {
  me: () => api<HairMe>('GET', '/hair/me'),
  dashboard: (branchId?: string) => api<DashboardData>('GET', '/hair/dashboard', { query: { branchId } }),
  appointments: async (query: { from: string; to: string; staffId?: string; branchId?: string }) =>
    listItems(await api<Appointment[] | { items: Appointment[] }>('GET', '/hair/appointments', { query })),
  appointment: (id: string) => api<Appointment>('GET', `/hair/appointments/${encodeURIComponent(id)}`),
  setStatus: (id: string, status: AppointmentStatus, reason?: string) =>
    api<Appointment>('PATCH', `/hair/appointments/${encodeURIComponent(id)}/status`, { body: { status, reason } }),
  customers: async (search?: string) =>
    listItems(await api<Customer[] | { items: Customer[] }>('GET', '/hair/customers', { query: { search } })),
};
