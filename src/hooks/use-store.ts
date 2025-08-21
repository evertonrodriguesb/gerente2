'use client';

import { useContext } from 'react';
import { StoreContext } from '@/contexts/store-context';

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
