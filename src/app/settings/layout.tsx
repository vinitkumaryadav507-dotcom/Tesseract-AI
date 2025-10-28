
import { FirebaseClientProvider } from '@/firebase/client-provider';
import React from 'react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
