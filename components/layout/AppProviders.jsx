'use client';
import { SWRConfig } from 'swr';
import { ToastProvider } from '@/components/ui/Toast';
import { useDataSync } from '@/lib/hooks';

function DataSync() {
  useDataSync();
  return null;
}

/** Client boundary for the whole app: SWR config, cross-tab sync and toasts. */
export default function AppProviders({ children }) {
  return (
    <SWRConfig value={{ dedupingInterval: 100, errorRetryCount: 0 }}>
      <ToastProvider>
        <DataSync />
        {children}
      </ToastProvider>
    </SWRConfig>
  );
}
