import { api, listItems } from '../lib/api';
import type { PublicAppointment, PublicBookingDto, PublicSalonInfo, PublicService, PublicStaff } from './types';

/** Public online booking (MainApi §4.13): no sign-in, the salon is addressed by its branch slug. */
const base = (slug: string) => `/hair/public/booking/${encodeURIComponent(slug)}`;

export const publicBooking = {
  info: (slug: string) => api<PublicSalonInfo>('GET', `${base(slug)}/info`, { anonymous: true }),
  services: async (slug: string) =>
    listItems(await api<PublicService[] | { items: PublicService[] }>('GET', `${base(slug)}/services`, { anonymous: true })),
  staff: async (slug: string, serviceIds: string[]) =>
    listItems(
      await api<PublicStaff[] | { items: PublicStaff[] }>('GET', `${base(slug)}/staff`, {
        anonymous: true,
        query: { serviceIds: serviceIds.join(',') },
      }),
    ),
  slots: async (slug: string, date: string, serviceIds: string[], staffId?: string) =>
    listItems(
      await api<string[] | { items: string[] }>('GET', `${base(slug)}/slots`, {
        anonymous: true,
        query: { date, serviceIds: serviceIds.join(','), staffId },
      }),
    ),
  requestOtp: (slug: string, phone: string) =>
    api<{ required?: boolean; sent?: boolean }>('POST', `${base(slug)}/otp`, { anonymous: true, body: { phone } }),
  book: (slug: string, dto: PublicBookingDto) =>
    api<PublicAppointment>('POST', `${base(slug)}/appointments`, { anonymous: true, body: dto }),
  appointment: (slug: string, id: string, token: string) =>
    api<PublicAppointment>('GET', `${base(slug)}/appointments/${encodeURIComponent(id)}`, { anonymous: true, query: { token } }),
  cancel: (slug: string, id: string, token: string) =>
    api<PublicAppointment>('PATCH', `${base(slug)}/appointments/${encodeURIComponent(id)}/cancel`, {
      anonymous: true,
      query: { token },
      body: {},
    }),
};
