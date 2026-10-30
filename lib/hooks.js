'use client';
// Client-side data hooks built on SWR (concept #8).
//
// How SWR fits a no-database app: the "fetcher" is a synchronous read from the
// localStorage data-access module. Every write helper calls emitChange(), which
// fires a `sw:data` window event; <DataSync /> reacts by revalidating every
// "sw:" SWR key. The native `storage` event does the same for OTHER tabs.
// This is local refresh - not server-backed real-time sync.
import { useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import {
  checkStorageHealth,
  getAnnouncements,
  getBookings,
  getCars,
  getDisputes,
  getReviews,
  getUsers,
} from './data.js';
import { getCurrentSession } from './auth.js';

const swrOptions = { revalidateOnFocus: true, revalidateOnReconnect: false };

export function useSession() {
  const { data, mutate } = useSWR('sw:session', () => getCurrentSession(), swrOptions);
  return {
    session: data || null,
    user: data ? data.user : null,
    isLoading: data === undefined,
    refresh: mutate,
  };
}

export function useAppData() {
  const users = useSWR('sw:users', () => getUsers(), swrOptions);
  const cars = useSWR('sw:cars', () => getCars(), swrOptions);
  const bookings = useSWR('sw:bookings', () => getBookings(), swrOptions);
  const reviews = useSWR('sw:reviews', () => getReviews(), swrOptions);
  const disputes = useSWR('sw:disputes', () => getDisputes(), swrOptions);
  const announcements = useSWR('sw:announcements', () => getAnnouncements(), swrOptions);
  const isLoading = [users, cars, bookings, reviews, disputes, announcements].some((r) => r.data === undefined);
  return {
    users: users.data || [],
    cars: cars.data || [],
    bookings: bookings.data || [],
    reviews: reviews.data || [],
    disputes: disputes.data || [],
    announcements: announcements.data || [],
    isLoading,
  };
}

export function useStorageHealth() {
  const { data } = useSWR('sw:health', () => checkStorageHealth(), swrOptions);
  return data || { available: true, problems: [] };
}

/** Mount once. Revalidates all SWR keys when data changes in this tab or any other tab. */
export function useDataSync() {
  const { mutate } = useSWRConfig();
  useEffect(() => {
    const refresh = () => mutate((key) => typeof key === 'string' && key.startsWith('sw:'));
    window.addEventListener('sw:data', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('sw:data', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [mutate]);
}
