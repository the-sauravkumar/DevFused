"use client";

import type React from 'react';
import { ThemeProvider } from '@/components/theme-provider';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
