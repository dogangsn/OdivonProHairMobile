import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Bookings made from this device. Until MainApi has /hair/client/appointments, the app keeps each
 * booking's access token here and reads its live status from the public booking API.
 */
export interface SavedBooking {
  slug: string;
  id: string;
  token: string;
  salonName: string;
  date: string;
  startTime: string;
  savedAt: string;
}

const KEY = 'odivon.bookings.v1';

export async function loadBookings(): Promise<SavedBooking[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedBooking[]) : [];
  } catch {
    return [];
  }
}

export async function saveBooking(booking: SavedBooking): Promise<void> {
  const list = (await loadBookings()).filter((b) => b.id !== booking.id);
  list.unshift(booking);
  await AsyncStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
}

export interface CustomerProfile {
  firstName: string;
  lastName: string;
}

const PROFILE_KEY = 'odivon.profile.v1';

export async function loadProfile(): Promise<CustomerProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as CustomerProfile) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: CustomerProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
